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
    this.closing = 0;
    this.cooldown = gameSettings.zoneCooldown;
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
            let zone = this.objects[id];

            //lower cooldown
            zone.cooldown -= gameSettings.tickRate;

            //spawn enemy if cooldown met
            if (zone.cooldown <= 0) {
                this.room.enemies.spawnEnemy();
                //reset cd
                zone.cooldown = gameSettings.zoneCooldown;
            }

            //assume no player contact
            zone.closing = 0;

            //loop through players
            for (let pid in this.room.players.playing) {
                let player = this.room.players.playing[pid];

                //check to see if player is colliding with zone
                if (Physics.isColliding(
                        zone,
                        zone.radius,
                        player,
                        gameSettings.playerTypes[player.type].radius,
                    )) {
                            //add one to closing count
                            zone.closing++;
                }
            }

            //shrink zone if it is closing
            zone.radius -= zone.closing;

            //delete zone if it gets small
            if (zone.radius < 30) {
                delete this.objects[id];
            }
        }
    }
}

Zones.prototype.spawnZone = function () {

    //get radius from settings
    let radius = gameSettings.zoneRadius;

    //place at random position still fully within game world
    let x = Math.floor(Math.random()*((gameSettings.width - 2*radius)+1))+radius;
    let y = Math.floor(Math.random()*((gameSettings.height - 2*radius)+1))+radius;

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
            closing: zone.closing,
        }
    }

    return zone_info;
}

//get count of zones
Zones.prototype.count = function () {
    return Object.keys(this.objects).length;
}

module.exports = Zones;