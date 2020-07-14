//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require(__dirname + '/gameSettings.js');


//Collision/Physics Functions from Physics.js
///////////////////////////////////////////////////////////////////////////

const Physics = require(__dirname + '/Physics.js');


//functions to be added to all player objects
const playerFunctions = {

    //return player radius
    getRadius: function () {
        return gameSettings.playerTypes[this.type].radius;
    },

    //return player max speed
    getMaxSpeed: function () {
        return gameSettings.playerTypes[this.type].maxVelocity;
    },

    //return player acceleration magnitude
    getAcceleration: function () {
        return gameSettings.playerTypes[this.type].acceleration;
    },

    //return player mass
    getMass: function () {
        return gameSettings.playerTypes[this.type].mass;
    },

    //return max health of player
    getMaxHealth() {
        return gameSettings.playerTypes[this.type].maxHealth;
    },

    //return info about player shots
    getShotInfo: function () {
        return gameSettings.playerTypes[this.type].shots;
    }
}


// class for players container
class Players {

    constructor(room) {

        //hold individual enemy objects
        this.objects = {};

        //hold players who have yet to choose a class
        this.waiting = {};

        //hold playing players
        this.playing = {};

        //save room that object exists in
        this.room = room;
    }

    //updates all player objects
    update() {

        //countdown respawn timer of dead players
        for (let id in this.waiting) {
            let player = this.waiting[id];

            if (this.room.gameOver) {
                player.respawnTimer = 0;
            }
            //otherwise subtract from timer, to min of 0
            else {
                player.respawnTimer = Math.max(
                    player.respawnTimer - gameSettings.tickRate,
                    0);
            }
        }

        if (!this.room.gameOver) {
            //loop through all players
            for (let id in this.playing) {

                let player = this.playing[id];

                //reduce shot cooldown
                player.cooldown -= gameSettings.tickRate;

                //shoot for player
                this.shootRequest(player);

                //move player
                if (player.health > 0) {

                    //degrade velocities when no angle
                    if (player.angle == 'none') {
                        player.velocity.x *= 0.95;
                        player.velocity.y *= 0.95;

                        //if slow enough, stop
                        if (Math.abs(player.velocity.x) < 0.1) {
                            player.velocity.x = 0;
                        }
                        if (Math.abs(player.velocity.y) < 0.1) {
                            player.velocity.y = 0;
                        }
                    }
                    //otherwise accelerate based on players angle and magnitude from settings
                    else {
                        let acceleration = Physics.componentVector(
                            player.angle,
                            player.getAcceleration());
                        //x with cos
                        if (Math.abs(Math.cos(player.angle)) < 0.1) {
                            player.velocity.x *= 0.95;
                            if (Math.abs(player.velocity.x) < 0.1) {
                                player.velocity.x = 0;
                            }
                        }
                        else {
                            player.velocity.x += acceleration.x;
                        }
                        //y win sin
                        if (Math.abs(Math.sin(player.angle)) < 0.1) {
                            player.velocity.y *= 0.95;
                            if (Math.abs(player.velocity.y) < 0.1) {
                                player.velocity.y = 0;
                            }
                        }
                        else {
                            player.velocity.y += acceleration.y;
                        }
                    }

                    //cap velocity
                    Physics.capVelocity(player, player.getMaxSpeed());

                    //move based on velocity
                    player.x += player.velocity.x;
                    player.y += player.velocity.y;

                    //check for collisions with other players
                    for (let pid in this.playing) {
                        if (player.id != pid &&
                            this.playing[pid].health > 0) {
                            let otherPlayer = this.playing[pid];
                            Physics.collideAndDisplace(
                                player,
                                player.getRadius(),
                                otherPlayer,
                                otherPlayer.getRadius()
                            );
                        }
                    }

                    //boundaries
                    player.x = Math.min(Math.max(player.x, 0), gameSettings.width);
                    player.y = Math.min(Math.max(player.y, 0), gameSettings.height);
                }
            }
        }
    }

    //collect info on players for emit to clients
    collect() {

        let playing_info = {};

        for (let id in this.playing) {
            let player = this.playing[id];
            playing_info[id] = {
                x: player.x,
                y: player.y,
                type: player.type,
                health: Math.max(0, player.health),
                name: player.name,
                killStreak: player.killStreak,
            };
        }

        let waiting_info = {};

        for (let id in this.waiting) {
            let player = this.waiting[id];
            waiting_info[id] = {
                x: player.x,
                y: player.y,
                type: player.type,
                name: player.name,
                killStreak: player.killStreak,
                respawnTimer: player.respawnTimer,
            };
        }

        return {
            playing: playing_info,
            waiting: waiting_info,
        };
    }

    //deal damage to a player
    damagePlayer(player, amount) {

        //make sure player is alive, and not cheating
        if (player.id in this.playing &&
            player.name.toUpperCase() != gameSettings.testName.toUpperCase()) {
            player.health = Math.max(0, player.health - amount);

            //handle death
            if (player.health <= 0) {

                //start respawn timer if game not over
                if (!this.room.gameOver) {
                    player.respawnTimer = gameSettings.respawnTime;
                }

                //move player to waiting
                this.waitPlayer(player);
            }
        }
    }

    //add life to a player
    healPlayer(player, amount) {

        //make sure player is alive
        if (player.id in this.playing) {
            //heal up to maximum for class
            player.health = Math.min(
                player.getMaxHealth(),
                player.health + amount
            );
        }
    }

    //request shoot for player if appropriate
    shootRequest(player) {

        //make sure alive, clicking, and not on cooldown
        if (player.id in this.playing &&
            player.health > 0 &&
            player.clicking &&
            player.cooldown <= 0) {

            //add 1 to ready shots
            player.readyShots++;

            //ask for coordinates
            player.emit('shoot_request');

            //start cooldown
            player.cooldown = player.getShotInfo().cooldown;
        }
    }

    //add new player
    add(player) {

        //add to players object
        this.objects[player.id] = player;

        //add to waiting object
        this.waitPlayer(player);

        //give default class
        player.type = 'none';

        //mark as not respawning
        player.respawnTimer = 0;

        //give no health
        player.health = 0;

        //start killStreak at 0
        player.killStreak = 0;

        //give default angle
        player.angle = 'none';

        //give default location
        player.x = 0;
        player.y = 0;

        //give default velocities
        player.velocity = {
            x: 0,
            y: 0,
        };

        //give default click value
        player.clicking = false;

        //start with no shooting cooldown
        player.cooldown = 0;

        //start with no ready shots
        player.readyShots = 0;

        //ADD UTLITY FUNCTIONS
        /////////////////////////////////
        //loop through each function and assign to player
        for (let funcName in playerFunctions) {
            player[funcName] = playerFunctions[funcName];
        }

        //SET UP LISTENERS
        /////////////////////////////////
        //set class based on player choice
        player.on('class_choice', function (type) {
            //only change if valid choice and a life exists
            if (this.room.livesCount > 0 &&
                player.id in this.waiting &&
                player.respawnTimer == 0 &&
                type in gameSettings.playerTypes) {

                //set class
                player.type = type;

                //subtract life
                this.room.livesCount--;

                //mark as not respawning
                player.respawnTimer = 0;


                //give default angle & velocities
                player.angle = 'none';
                player.velocity = {
                    x: 0,
                    y: 0,
                };

                //give random position in world
                player.x = Math.floor(Math.random() * (gameSettings.width - 200 + 1)) + 100;
                player.y = Math.floor(Math.random() * (gameSettings.height - 200 + 1)) + 100;

                //give max health based on class
                player.health = player.getMaxHealth();

                //reset killstreak
                player.killStreak = 0;

                //move to playing object
                this.playPlayer(player);
            }
        }.bind(this)); //bind to scope


        //switch player movement angle
        player.on('angle', function (angle) {
            player.angle = angle;
        });

        //switch clicking state
        player.on('click', function (clicking) {
            player.clicking = clicking;
            //request shoot right away to avoid a click getting clipped by tickRate
            this.shootRequest(player);
        }.bind(this)); //bind to scope


        //handle shooting
        player.on('shoot', function (destX, destY) {
            //only shoot if alive and have ready shots
            if (player.id in this.playing &&
                player.health > 0 &&
                player.readyShots > 0) {

                //remove 1 ready shot
                player.readyShots--;

                //create shots
                this.room.shots.spawnPlayerShot(player, destX, destY);
            }
        }.bind(this)); //bind to scope


        //restart game if client requests
        player.on('restart_game', function () {
            this.room.reset();
        }.bind(this)); //bind to scope
    }

    //moves player to waiting object
    waitPlayer(player) {
        if (player.id in this.objects) {
            this.waiting[player.id] = player;
            delete this.playing[player.id];
        }
    }

    //moves player to playing object
    playPlayer(player) {
        if (player.id in this.objects) {
            this.playing[player.id] = player;
            delete this.waiting[player.id];
        }
    }

    //removes player from object
    remove(player) {
        if (player.id in this.objects) {
            delete this.objects[player.id];
            delete this.playing[player.id];
            delete this.waiting[player.id];
        }
    }

    //resets all players
    reset() {
        for (let id in this.objects) {
            this.objects[id].health = 0;
            this.objects[id].type = 'none';
            this.objects[id].killStreak = 0;

            //move to waiting object
            this.waitPlayer(this.objects[id]);
        }
    }

    //checks if all players are dead
    allDead() {
        for (let id in this.objects) {
            if (this.objects[id].health > 0) {
                return false;
            }
        }
        return true;
    }

    //counts players currently in room
    count() {
        return Object.keys(this.objects).length;
    }

    //counts players currently in room & playing
    playingCount() {
        return Object.keys(this.playing).length;
    }

    //counts players currently in room & waiting
    waitingCount() {
        return Object.keys(this.waiting).length;
    }
}

module.exports = Players;