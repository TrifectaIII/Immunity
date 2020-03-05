//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require('./gameSettings.js');


//Collision/Physics Functions from Physics.js
///////////////////////////////////////////////////////////////////////////

const Physics = require('./Physics.js');


//Objects to control different game entities
///////////////////////////////////////////////////////////////////////////

const Players = require('./Players.js');
const Shots = require('./Shots.js');
const Enemies = require('./Enemies.js');
const Pickups = require('./Pickups.js');





// ROOM CONSTRUCTOR
///////////////////////////////////////////////////////////////////////////

//constructor for room objects
function Room (roomId) {

    this.roomId = roomId;

    //hold info about game objects
    this.players = new Players(this);
    this.shots = new Shots(this);
    this.pickups = new Pickups(this);
    this.enemies = new Enemies(this);

    //counts each enemy wave
    this.waveCount = 0;

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

    //update game objects
    this.players.update();
    this.shots.update();
    this.enemies.update();
    this.pickups.update();


    //check for a game over
    //if lives left or a player alive, not a game over
    this.gameOver = this.players.allDead() && this.livesCount <= 0;

    //collect return game info for emit to clients in room
    return {
        player_info: this.players.collect(),
        shot_info: this.shots.collect(),
        pickup_info: this.pickups.collect(),
        enemy_info: this.enemies.collect(),

        game_info: {
            waveCount: this.waveCount,
            livesCount: this.livesCount,
            gameOver: this.gameOver,
        },
    }
}

// ADD SOCKET TO ROOM AND SET IT UP
///////////////////////////////////////////////////////////////////////////

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


// OTHER ROOM METHODS
///////////////////////////////////////////

//remove socket if socket exists in room
Room.prototype.removePlayer = function (player) {
    this.players.remove(player);
}

Room.prototype.reset = function () {
    //make sure game is actually over
    if (this.gameOver) {

        //reset all players
        this.players.reset();

        //reset room
        this.enemies = new Enemies(this);
        this.shots = new Shots(this);
        this.pickups = new Pickups(this);

        this.waveCount = 0;
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



// EXPORTS CONSTRCTOR TO index.js
///////////////////////////////////////////////////////////////////////////
module.exports = Room;