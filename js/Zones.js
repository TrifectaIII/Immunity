//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require(__dirname + '/gameSettings.js');


//Collision/Physics Functions from Physics.js
///////////////////////////////////////////////////////////////////////////

const Physics = require(__dirname + '/Physics.js');


//object constructor for individual pickup
function Zone (x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
}

// object constructor for pickups container
function Zones (room) {

    //hold individual pickup objects
    this.objects = {};

    //counter for object id's
    this.idCounter = 0;

    //save room that object exists in
    this.room = room;
}

//updates all enemies
Zones.prototype.update = function () {

    if (!this.room.gameOver) {

        //loop through all zones
        for (let id in this.objects) {

        }
    }
}

Zones.prototype.spawnZone = function (x, y, radius) {

    //increment id counter and generate id for new object
    let id = 'zone' + (this.idCounter++).toString();

    //create new object
    this.objects[id] = new Zone (x, y, radius);
}

//collect info to send to clients
Zones.prototype.collect = function () {
    let zone_info = {};

    for (let id in this.objects) {
        let zone = this.objects[id];
        zone_info[id] = {
            x: zone.x,
            y: zone.y,
            radius: zone.radius,
        }
    }

    return zone_info;
}

module.exports = Zones;