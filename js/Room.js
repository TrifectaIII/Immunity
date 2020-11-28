//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require(__dirname + '/../gameSettings.js');


//Collision/Physics Functions from Physics.js and QuadTree from QTree.js
///////////////////////////////////////////////////////////////////////////

const Physics = require(__dirname + '/Physics.js');
const QT = require(__dirname +'/Qtree.js');


//Containers to control different game entities
///////////////////////////////////////////////////////////////////////////

const Players = require(__dirname + '/Players.js');
const Shots = require(__dirname + '/Shots.js');
const Enemies = require(__dirname + '/Enemies.js');
const Pickups = require(__dirname + '/Pickups.js');
const Zones = require(__dirname + '/Zones.js');
const Bosses = require(__dirname + '/Bosses.js');
const Abilities = require(__dirname + '/Abilities.js');


//Database Library for high scores
///////////////////////////////////////////////////////////////////////////

const Database = require(__dirname + '/Database.js');


//Performance.js for benchmarking 
///////////////////////////////////////////////////////////////////////////
const { PerformanceObserver, performance } = require('perf_hooks');


// ROOM CLASS
///////////////////////////////////////////////////////////////////////////

//class for room objects
class Room {

    constructor(roomId, io) {

        this.roomId = roomId;

        this.io = io;

        //objects to hold each type of game object
        this.players = new Players(this);
        this.shots = new Shots(this);
        this.enemies = new Enemies(this);
        this.bosses = new Bosses(this);
        this.pickups = new Pickups(this);
        this.zones = new Zones(this);
        this.abilities = new Abilities(this);

        //create a Quad tree covering the game world with capacity of each node at 4
        this.Quadtree = new QT.Qtree(new QT.QT_bound(gameSettings.width / 2, gameSettings.height / 2, gameSettings.width, gameSettings.height, 4));

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

        //interval for updating game
        this.updateInterval = setInterval(function () {

            //update game
            let serverData = this.update();

            //send game info to clients
            this.io.to(this.roomId).emit('game_update', serverData);
            //tickrate from settings
        }.bind(this), gameSettings.tickRate);
    }

    // ROOM UPDATE
    ///////////////////////////////////////////////////////////////////////

    //called every gameSettings.tickRate (ms)
    update() {

        //only update game if active
        if (!this.gameOver &&
            this.players.playingCount() > 0) {

            //spawn new wave if needed
            this.spawnWave();

            //update game objects
            this.shots.update();
            this.enemies.update();
            this.bosses.update();
            this.pickups.update();
            this.zones.update();
            this.abilities.update();
            this.update_Quadtree();
        }

        //update players always
        this.players.update();

        //if no lives and all players dead, game is over
        const savedGO = this.gameOver;
        this.gameOver = this.players.allDead() && this.livesCount <= 0;

        //send score to db if game just ended
        if (!savedGO && this.gameOver) {
            const nameString = this.players.collectNames().join(', ');
            Database.addScore(nameString, this.waveCount, () => {
                Database.getTopScores(10,(rows) =>{console.log(rows)});
            });
        }

        //collect return game info for emit to clients in room
        return {
            players: this.players.collect(),
            shots: this.shots.collect(),
            enemies: this.enemies.collect(),
            bosses: this.bosses.collect(),
            pickups: this.pickups.collect(),
            zones: this.zones.collect(),
            abilities: this.abilities.collect(),

            roomInfo: {
                waveCount: this.waveCount,
                livesCount: this.livesCount,
                gameOver: this.gameOver,
                waveTimer: this.waveTimer,
            },
        };
    }

    // OTHER METHODS
    ///////////////////////////////////////////////////////////////////////

    //creates a wave of enemies
    spawnWave() {

        //countdown wave timer when no zones or bosses
        if (this.zones.count() <= 0 &&
            this.bosses.count() <= 0) {
            this.waveTimer = Math.max(
                0,
                this.waveTimer - gameSettings.tickRate);
        }

        //check the old wave is gone and that timer is off
        if (this.waveTimer <= 0) {

            //increase wavecount
            this.waveCount++;

            //restart timer for next time
            this.waveTimer = gameSettings.waveTime;

            //usually spawn enemy/zone wave
            if (!gameSettings.bossEnabled ||
                this.waveCount % gameSettings.bossFrequency != 0) {
                //roll for mono wave chance
                if (Math.random() > gameSettings.enemyMonoChance) {
                    this.waveType = 'random';
                }
                else {
                    let typeList = Object.keys(gameSettings.enemyTypes);
                    this.waveType = typeList[Math.floor(Math.random() * typeList.length)];
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
            //otherwise spawn boss wave
            else {
                this.bosses.spawnBoss();
            }
        }
    }

    //adds player to room
    addPlayer(socket, name) {

        //join socketio room
        socket.join(this.roomId);

        //set roomId to socket
        socket.roomId = this.roomId;

        //if haven't seen enough players to meet cap yet, give a life
        if (!this.gameOver &&
            this.playersSeen < gameSettings.roomCap) {
            this.livesCount++;
            this.playersSeen++;
        }

        //add to players
        this.players.add(socket, name);

        //confirm join with server after player totally set up
        socket.emit('joined', this.roomId);
    }

    //remove socket if socket exists in room
    removePlayer(socket) {
        this.players.remove(socket);
    }

    //reset room when new game starts
    reset() {
        //make sure game is actually over
        if (this.gameOver) {

            //reset all players
            this.players.reset();

            //recreate other game objects
            this.shots = new Shots(this);
            this.enemies = new Enemies(this);
            this.pickups = new Pickups(this);
            this.bosses = new Bosses(this);
            this.zones = new Zones(this);
            this.abilities = new Abilities(this);

            //reset attributes
            this.waveCount = 0;
            this.waveTimer = gameSettings.waveTime;
            this.playersSeen = this.players.count();
            this.livesCount = gameSettings.livesStart + this.players.count();
            this.gameOver = false;
        }
    }

    //shut down room in preparation for deletion
    shutDown() {
        clearInterval(this.updateInterval);
    }

    //get current population of room
    playerCount() {
        return this.players.count();
    }

    //checks if room is full of players
    isFull() {
        return this.players.count() >= gameSettings.roomCap;
    }

    //checks if room is empty
    isEmpty() {
        return this.players.count() == 0;
    }

    //collate all objects for qtree
    get_AllObj() {
        return [
            ...Object.values(this.players.objects),
            ...Object.values(this.enemies.objects),
            ...Object.values(this.bosses.objects),
            //MAX CALL STACK BUG IF YOU INCLUDE SHOTS
            // ...Object.values(this.shots.objects),
            ...Object.values(this.zones.objects),
            ...Object.values(this.abilities.objects),
        ];
    }

    //update qtree
    update_Quadtree() {
        this.Quadtree = new QT.Qtree(new QT.QT_bound(gameSettings.width / 2, gameSettings.height / 2, gameSettings.width, gameSettings.height), 4);

        //reinsert objects into the new Quadtree
        let objs = this.get_AllObj();
        for (let i in objs) {
            this.Quadtree.insert(objs[i]);
        }
    }
}

// EXPORTS CLASS TO index.js
///////////////////////////////////////////////////////////////////////////
module.exports = Room;