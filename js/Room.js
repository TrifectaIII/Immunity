//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require(__dirname + '/gameSettings.js');


//Collision/Physics Functions from Physics.js
///////////////////////////////////////////////////////////////////////////

const Physics = require(__dirname + '/Physics.js');


//Objects to control different game entities
///////////////////////////////////////////////////////////////////////////

const Players = require(__dirname + '/Players.js');
const Shots = require(__dirname + '/Shots.js');
const Enemies = require(__dirname + '/Enemies.js');
const Pickups = require(__dirname + '/Pickups.js');
const Zones = require(__dirname + '/Zones.js');
const Bosses = require(__dirname + '/Bosses.js');


//Quadtree class
const QT = require(__dirname +'/Qtree.js');


//Performance.js for benchmarking 
const { PerformanceObserver, performance } = require('perf_hooks');


// ROOM CONSTRUCTOR
///////////////////////////////////////////////////////////////////////////

//constructor for room objects
function Room (roomId) {

    this.roomId = roomId;

    //objects to hold each type of game object
    this.players = new Players(this);
    this.shots = new Shots(this);
    this.enemies = new Enemies(this);
    this.pickups = new Pickups(this);
    this.zones = new Zones(this);

    //create a Quad tree covering the game world with capacity of each node at 4
    this.Quadtree = new QT.Qtree(new QT.QT_bound(gameSettings.width/2, gameSettings.height/2, gameSettings.width, gameSettings.height, 4));

    //counts each enemy wave
    this.waveCount = 0;

    //type of current wave
    this.waveType = 'random';

    //timer until next wave
    this.waveTimer = gameSettings.waveTime;

    //how many lives the players have
    this.livesCount = gameSettings.livesStart;

    //how many players have joined at any time, up to 4
    this.playersSeen = 0;

    //switch for if the game is over
    this.gameOver = false;

}


// ROOM UPDATE
///////////////////////////////////////////////////////////////////////////

//called every gameSettings.tickRate ms in index.js
Room.prototype.update = function () {

    //update players always
    this.players.update();

    //only update game if active
    if (!this.gameOver && 
        this.players.playingCount() > 0) {

            //spawn new wave if needed
            this.spawnWave();

            //update game objects
            this.shots.update();
            this.enemies.update();
            this.pickups.update();
            this.zones.update();
            this.update_Quadtree();
    }

    //if no lives and all players dead, game is over
    this.gameOver = this.players.allDead() && this.livesCount <= 0;

    //collect return game info for emit to clients in room
    return {
        playerData: this.players.collect(),
        shotData: this.shots.collect(),
        enemyData: this.enemies.collect(),
        pickupData: this.pickups.collect(),
        zoneData: this.zones.collect(),

        roomData: {
            waveCount: this.waveCount,
            livesCount: this.livesCount,
            gameOver: this.gameOver,
            waveTimer: this.waveTimer,
        },
    }
}


// OTHER METHODS
///////////////////////////////////////////////////////////////////////////

//creates a wave of enemies
Room.prototype.spawnWave = function () {

    //countdown wave timer
    if (this.zones.count() <= 0) {
        this.waveTimer = Math.max(
            0,
            this.waveTimer - gameSettings.tickRate,
        );
    }

    //check the old wave is gone and that timer is off
    if (this.zones.count() <= 0 &&
        this.waveTimer == 0) {

            //increase wavecount
            this.waveCount++;
            
            //restart timer for next time
            this.waveTimer = gameSettings.waveTime;

            //roll for mono wave chance
            if (Math.random() > gameSettings.enemyMonoChance) {
                this.waveType = 'random';
            }
            else {
                let typeList = Object.keys(gameSettings.enemyTypes);
                this.waveType = typeList[Math.floor(Math.random()*typeList.length)];
            }

            //spawn number of enemies based on number of players and wave count
            let enemyNum = this.playerCount() * (
                gameSettings.enemyCountStart + 
                (this.waveCount - 1) * 
                gameSettings.enemyCountScale
            );
            for (let i = 0; i < enemyNum; i++) {
                this.enemies.spawnEnemy();
            }

            //spawn zones based on player count
            let zoneNum = this.playerCount() * gameSettings.zoneCount;
            for (let i = 0; i < zoneNum; i++) {
                this.zones.spawnZone();
            }
    }
}

//adds player to room
Room.prototype.addPlayer = function (player) {
    
    //join socketio room
    player.join(this.roomId);

    //set roomId to socket
    player.roomId = this.roomId;

    //if haven't seen enough players to meet cap yet, give a life
    if (!this.gameOver &&
        this.playersSeen < gameSettings.roomCap) {
            this.livesCount++;
            this.playersSeen++;
    }

    //add to players
    this.players.add(player);

    //confirm join with server after player totally set up
    player.emit('joined',this.roomId);
}

//remove socket if socket exists in room
Room.prototype.removePlayer = function (player) {
    this.players.remove(player);
}

Room.prototype.reset = function () {
    //make sure game is actually over
    if (this.gameOver) {

        //reset all players
        this.players.reset();

        //recreate other game objects
        this.shots = new Shots(this);
        this.enemies = new Enemies(this);
        this.pickups = new Pickups(this);
        this.zones = new Zones(this);

        //reset attributes
        this.waveCount = 0;
        this.waveTimer = gameSettings.waveTime;
        this.playersSeen = this.players.count();
        this.livesCount = gameSettings.livesStart + this.players.count();
        this.gameOver = false;
    }
}

//get current population of room
Room.prototype.playerCount = function () {
    return this.players.count();
}

//checks if room is full of players
Room.prototype.isFull = function () {
    return this.players.count() >= gameSettings.roomCap;
}

//checks if room is empty
Room.prototype.isEmpty = function () {
    return this.players.count() == 0;
}

Room.prototype.get_AllObj = function(){
    return [
        ...Object.values(this.enemies.objects), 
        ...Object.values(this.players.objects),
        //BUG IF YOU INCLUDE ENEMY SHOTS
        ...Object.values(this.shots.playershots),
        ...Object.values(this.zones.objects),
    ]; 
}

Room.prototype.update_Quadtree = function (){
    this.Quadtree = new QT.Qtree(new QT.QT_bound(gameSettings.width/2, gameSettings.height/2, gameSettings.width, gameSettings.height),4);

    //reinsert objects into the new Quadtree
    let objs = this.get_AllObj();
    for (let i in objs){
        this.Quadtree.insert(objs[i]);
    }
}



// EXPORTS CONSTRCTOR TO index.js
///////////////////////////////////////////////////////////////////////////
module.exports = Room;