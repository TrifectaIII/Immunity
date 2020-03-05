//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require('./gameSettings.js');



//Collision/Physics Functions from Physics.js
///////////////////////////////////////////////////////////////////////////

const Physics = require('./Physics.js');


// object constructor for enemies
function Pickups (room) {

    //hold individual pickup objects
    this.pickups = {};

    //counter for object id's
    this.idCounter = 0;

    //save room that object exists in
    this.room = room;

    //counts down to pickup spawn
    this.spawnTimer = gameSettings.pickupTime;
}

//updates all enemies
Pickups.prototype.update = function () {

    if (!this.room.gameOver) {

        //create new pickup if time
        this.spawnTimer -= gameSettings.tickRate;
        if (this.spawnTimer <= 0) {
            this.spawnPickup();
            this.spawnTimer = gameSettings.pickupTime;
        }
    
        let players = this.room.players.players;

        //loop through all pickups
        for (let id in this.pickups) {
            let pickup = this.pickups[id];

            //find closest alive player
            let closestDistance = Infinity;
            let closestId = 0;
            for (let pid in players) {
                if (players[pid].type != 'none' &&
                    players[pid].health > 0) {
                    let thisDistance = Physics.distance(players[pid], pickup);
                    if (thisDistance < closestDistance) {
                        closestDistance = thisDistance;
                        closestId = pid;
                    }
                }
            }
            let player = players[closestId];

            //if player is close enough
            if (closestDistance < Infinity &&
                Physics.isColliding(
                    player, 
                    gameSettings.playerTypes[player.type].radius,
                    pickup, 
                    gameSettings.pickupRadius
                )
            ) {

                //effect determined by type
                switch (pickup.type) {
                    case "health":
                        //if player not at max health
                        if (player.health < gameSettings.playerTypes[player.type].maxHealth) {
                            //give health and delete pickup
                            player.health = Math.min(
                                gameSettings.playerTypes[player.type].maxHealth,
                                player.health + gameSettings.pickupHealthAmount
                            );
                            delete this.pickups[id];
                        }
                        break;

                    case "life":
                        //give another life to room
                        this.room.livesCount++;
                        delete this.pickups[id];
                }
            }
        }
    } 
}

//spawn a new pickup
Pickups.prototype.spawnPickup = function () {

    //make sure we are under cap
    //cap is pickupMax * number of players
    if (Object.keys(this.pickups).length < this.room.playerCount() * gameSettings.pickupMax) {

        //use id counter as id, then increase
        let id = this.idCounter++;

        //calculate type based on chances
        let typeMax = 0
        for (let type in gameSettings.pickupTypes) {
            typeMax += gameSettings.pickupTypes[type].chance;
        }
        let typeNum = Math.floor(Math.random() * (typeMax + 1));
        let chosenType = '';
        for (let type in gameSettings.pickupTypes) {
            if (typeNum <= gameSettings.pickupTypes[type].chance) {
                chosenType = type;
                break;
            }
            else {
                typeNum -= gameSettings.pickupTypes[type].chance;
            }
        }

        //create pickup object
        this.pickups[id] = {
            type: chosenType,
            x: Math.floor(Math.random()*(gameSettings.width+1)),
            y: Math.floor(Math.random()*(gameSettings.height+1)),
        }
    }
}

//collect info to send to clients
Pickups.prototype.collect = function () {
    let pickup_info = {};

    for (let id in this.pickups) {
        let pickup = this.pickups[id];
        pickup_info[id] = {
            x: pickup.x,
            y: pickup.y,
            type: pickup.type,
        }
    }

    return pickup_info;
}

module.exports = Pickups;