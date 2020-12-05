//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require(__dirname + '/../gameSettings.js');


//Container Class for Extending from Container.js
///////////////////////////////////////////////////////////////////////////

const Container = require(__dirname + '/Container.js');


//Collision/Physics Functions from Physics.js
///////////////////////////////////////////////////////////////////////////

const Physics = require(__dirname + '/Physics.js');


//class for individual zones
class Zone {

    constructor(id, x, y, startRadius) {
        this.id = id;
        this.x = x;
        this.y = y;

        //current and maximum radius
        this.radius = startRadius;
        this.maxRadius = startRadius;

        this.closing = 0;
        this.cooldown = gameSettings.zoneCooldown;
    }
}


// class for zones container
class Zones extends Container {

    constructor(room) {

        //call Container constructor
        super(room);

        //counter for object id's
        this.idCounter = 0;
    }

    //updates all enemies
    update() {

        //loop through all zones
        for (let id in this.objects) {
            let zone = this.objects[id];

            //lower cooldown
            zone.cooldown -= (1000/gameSettings.tickRate);

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
                    player.getRadius())) {
                    //add one to closing count
                    zone.closing++;
                }
            }

            //close zone if players inside it
            if (zone.closing > 0) {
                zone.radius -= zone.closing * gameSettings.zoneCloseRate;
            }
            //other wise grow, up to maximum
            else {
                zone.radius = Math.min(
                    zone.maxRadius,
                    zone.radius + gameSettings.zoneGrowRate);
            }

            //delete zone if it gets small
            if (zone.radius < 30) {
                delete this.objects[id];
            }
        }
    }

    //create a zone
    spawnZone() {

        //get radius from settings, plus 10 for each wave
        let startRadius = Math.min(
            gameSettings.zoneRadiusStart + (this.room.waveCount - 1) * gameSettings.zoneRadiusScale,
            //capped at settings max
            gameSettings.zoneRadiusMax);

        //place at random position still fully within game world
        let x = Math.floor(Math.random() * ((gameSettings.width - 2 * startRadius) + 1)) + startRadius;
        let y = Math.floor(Math.random() * ((gameSettings.height - 2 * startRadius) + 1)) + startRadius;

        //increment id counter and generate id for new object
        let id = 'zone' + (this.idCounter++).toString();

        //create new object
        this.objects[id] = new Zone(id, x, y, startRadius);
    }

    //collect info to send to clients
    collect() {
        let zone_info = {};

        for (let id in this.objects) {
            let zone = this.objects[id];
            zone_info[id] = {
                x: zone.x,
                y: zone.y,
                radius: zone.radius,
                closing: zone.closing,
            };
        }

        return zone_info;
    }
}

//export to room
module.exports = Zones;