//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require(__dirname + '/gameSettings.js');


//Collision/Physics Functions from Physics.js
///////////////////////////////////////////////////////////////////////////

const Physics = require(__dirname + '/Physics.js');


//object constructor for individual pickup
function Pickup (type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
}

// object constructor for pickups container
function Pickups (room) {

    //hold individual pickup objects
    this.objects = {};

    //counter for object id's
    this.idCounter = 0;

    //save room that object exists in
    this.room = room;
}

//updates all pickups
Pickups.prototype.update = function () {

    if (!this.room.gameOver) {
    
        let players = this.room.players.playing;

        //loop through all pickups
        for (let id in this.objects) {
            let pickup = this.objects[id];

            //find closest alive player
            let closestDistance = Infinity;
            let closestId = 0;

            for (let pid in players) {
                if (players[pid].health > 0) {
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
                            delete this.objects[id];
                        }
                        break;

                    case "life":
                        //give another life to room
                        this.room.livesCount++;
                        delete this.objects[id];
                }
            }
        }
    } 
}

//spawn a new pickup (called when enemy dies)
Pickups.prototype.spawnPickup = function (x, y) {

    //make sure we are under cap
    //cap is pickupMax * number of players
    if (this.count() < this.room.playerCount() * gameSettings.pickupMax) {

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

        //use id counter as id, then increase
        let id = 'pickup' + (this.idCounter++).toString();

        //create pickup object
        this.objects[id] = new Pickup(chosenType, x, y);
    }
}

//collect info to send to clients
Pickups.prototype.collect = function () {
    let pickup_info = {};

    for (let id in this.objects) {
        let pickup = this.objects[id];
        pickup_info[id] = {
            x: pickup.x,
            y: pickup.y,
            type: pickup.type,
        }
    }

    return pickup_info;
}

//get count of pickups
Pickups.prototype.count = function () {
    return Object.keys(this.objects).length;
}

module.exports = Pickups;