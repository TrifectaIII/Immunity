//calculates distance
function distance(socket, shot) {
    return Math.sqrt(
        Math.pow(socket.x-shot.x, 2) + 
        Math.pow(socket.y-shot.y ,2)
    );
}

//constructor for room objects
function Room (io, game, gameCode, socket) {
    this.game = game;
    this.io = io;
    this.gameCode = gamecode;
    this.players = {};
    this.players[socket.id] = socket;
    this.shots = {};
}

//updates room for update loop
Room.prototype.update = function () {

}

//add a socket if space available
Room.prototype.addSocket = function (socket) {
    if (this.getPop() < this.game.roomCap) {
        this.players[socket.id] = socket;
    }
}

//remove socket if socket exists in room
Room.prototype.removeSocket = function (socket) {
    if (socket.id in this.players) {
        delete this.players[socket.id];
    }
}

//get current population of room
Room.prototype.getPop = function () {
    return Object.keys(this.players).length;
}

//checks if room has space
Room.prototype.hasSpace = function () {
    return this.getPop() < this.game.roomCap;
}

//checks if room is empty
Room.prototype.isEmpty = function () {
    return this.getPop() == 0;
}
 
module.exports = {
    Room:Room,
}