//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require(__dirname + '/../gameSettings.js');


//Container Class for Extending from Container.js
///////////////////////////////////////////////////////////////////////////

const Container = require(__dirname + '/Container.js');


//Collision/Physics Functions from Physics.js
///////////////////////////////////////////////////////////////////////////

const Physics = require(__dirname + '/Physics.js');


//individual player objects
class Player {

    constructor (socket, name) {

        this.socket = socket;
        this.id = socket.id;
        this.name = name;

        //give default class
        this.type = 'none';

        //mark as not respawning
        this.respawnTimer = 0;

        //give no health
        this.health = 0;

        //start killStreak at 0
        this.killStreak = 0;

        //start ability buildup at 0
        this.abilityProgress = 0;

        //give default angle
        this.angle = 'none';

        //give default location
        this.x = 0;
        this.y = 0;

        //give default velocities
        this.velocity = {
            x: 0,
            y: 0,
        };

        //give default click value
        this.clicking = false;

        //start with no shooting cooldown
        this.cooldown = 0;

        //start with no ready shots
        this.readyShots = 0;

        //to hold ability object
        this.ability = null;
    }

    //return player radius
    getRadius () {
        return gameSettings.playerTypes[this.type].radius;
    }

    //return player max speed
    getMaxSpeed () {
        return gameSettings.playerTypes[this.type].maxVelocity;
    }

    //return acceleration magnitude
    getAcceleration () {
        return gameSettings.playerTypes[this.type].acceleration;
    }

    //return acceleration adjusted for tickrate
    getTickAcceleration () {
        return gameSettings.playerTypes[this.type].acceleration/gameSettings.tickRate;
    }

    //return current velocity adjusted for tickrate
    getTickVelocity () {
        return {
            x: this.velocity.x/gameSettings.tickRate,
            y: this.velocity.y/gameSettings.tickRate
        }
    }

    //return player mass
    getMass () {
        return gameSettings.playerTypes[this.type].mass;
    }

    //return max health of player
    getMaxHealth () {
        return gameSettings.playerTypes[this.type].maxHealth;
    }

    //return info about player shots
    getShotInfo () {
        return gameSettings.playerTypes[this.type].shots;
    }

    //returns bool of current testing state
    isTesting () {
        return this.name.toUpperCase() === gameSettings.testName.toUpperCase();
    }
}


// class for players container
class Players extends Container {

    constructor(room) {

        //call Container constructor
        super(room);

        //hold players who have yet to choose a class
        this.waiting = {};

        //hold playing players
        this.playing = {};
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
                    player.respawnTimer - (1000/gameSettings.tickRate),
                    0
                );
            }
        }

        if (!this.room.gameOver) {
            //loop through all players
            for (let id in this.playing) {

                let player = this.playing[id];

                //reduce shot cooldown
                player.cooldown -= (1000/gameSettings.tickRate);

                //shoot for player
                this.shootRequest(player);

                //move player
                if (player.health > 0) {

                    //degrade velocities when no angle
                    if (player.angle == 'none') {
                        // player.velocity.x *= 0.95;
                        // player.velocity.y *= 0.95;

                        // //if slow enough, stop
                        // if (Math.abs(player.velocity.x) < 0.1) {
                        //     player.velocity.x = 0;
                        // }
                        // if (Math.abs(player.velocity.y) < 0.1) {
                        //     player.velocity.y = 0;
                        // }
                    }
                    //otherwise accelerate based on players angle and magnitude from settings
                    else {
                        let acceleration = Physics.componentVector(
                            player.angle,
                            player.getTickAcceleration());
                        //x with cos
                        // if (Math.abs(Math.cos(player.angle)) < 0.1) {
                        //     player.velocity.x *= 0.95;
                        //     if (Math.abs(player.velocity.x) < 0.1) {
                        //         player.velocity.x = 0;
                        //     }
                        // }
                        // else {
                            player.velocity.x += acceleration.x;
                        // }
                        // //y win sin
                        // if (Math.abs(Math.sin(player.angle)) < 0.1) {
                        //     player.velocity.y *= 0.95;
                        //     if (Math.abs(player.velocity.y) < 0.1) {
                        //         player.velocity.y = 0;
                        //     }
                        // }
                        // else {
                            player.velocity.y += acceleration.y;
                        // }
                    }

                    //cap velocity
                    Physics.capVelocity(player, player.getMaxSpeed());

                    //move based on velocity
                    let tickVel = player.getTickVelocity();
                    player.x += tickVel.x;
                    player.y += tickVel.y;

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
                abilityProgress: player.abilityProgress,
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

    //gets list of player names, sorted
    collectNames () {
        return Object.keys(this.objects).map((id) => {
            return this.objects[id].name;
        });
    }

    //deal damage to a player
    damagePlayer(player, amount) {

        //make sure player is alive, and is not in test mode
        if (player.id in this.playing &&
            !player.isTesting()) {

                //skip if player is protected by a shield
                if (player.ability && player.ability.constructor.name === 'Shield') {
                    return;
                }
                
                // take health away
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

    //increase killstreak and ability prog when kill enemy
    giveKillCredit(player) {
        player.killStreak++;

        //only give ability progress if no active ability
        if (!player.ability) {
            player.abilityProgress = Math.min(
                player.abilityProgress+1, 
                gameSettings.abilityCap
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
            player.socket.emit('shoot_request');

            //start cooldown
            if (!player.ability || player.ability.constructor.name !== 'FullAuto') {
                player.cooldown = player.getShotInfo().cooldown; 
            }
            //if full auto is active, cooldown reduced based on settings
            else {
                player.cooldown = player.getShotInfo().cooldown/gameSettings.abilityTypes.fullauto.multiplier;
            }
        }
    }

    //add new player
    add(socket, name) {

        //create player object
        let player = new Player(socket, name);

        //add to players object
        this.objects[player.id] = player;

        //add to waiting object
        this.waitPlayer(player);

        //SET UP LISTENERS
        /////////////////////////////////

        //set class based on player choice
        player.socket.on('class_choice', function (type) {
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

                //reset ability progress
                player.abilityProgress = 0;

                //move to playing object
                this.playPlayer(player);
            }
        }.bind(this)); //bind to scope


        //switch player movement angle
        player.socket.on('angle', function (angle) {
            player.angle = angle;
        });

        //switch clicking state
        player.socket.on('click', function (clicking) {
            player.clicking = clicking;
            //request shoot right away to avoid a click getting clipped by tickDelay
            this.shootRequest(player);
        }.bind(this)); //bind to scope


        //handle shooting
        player.socket.on('shoot', function (destX, destY) {
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

        //handle ability activation
        player.socket.on('ability', function () {

            //stop if player already has an active ability
            if (player.ability) return;

            //check to make sure progress is full, or in testing mode
            if (player.abilityProgress === gameSettings.abilityCap ||
                player.isTesting()) {

                    //drain progress
                    player.abilityProgress = 0;

                    //create ability
                    this.room.abilities.spawnAbility(player);
            }
        }.bind(this)); //bind to scope

        //restart game if client requests
        player.socket.on('restart_game', function () {
            this.room.reset();
        }.bind(this)); //bind to scope
    }

    //removes player from object
    remove(socket) {
        if (socket.id in this.objects) {
            delete this.objects[socket.id];
            delete this.playing[socket.id];
            delete this.waiting[socket.id];
        }
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

    //counts players currently in room & playing
    playingCount() {
        return Object.keys(this.playing).length;
    }

    //counts players currently in room & waiting
    waitingCount() {
        return Object.keys(this.waiting).length;
    }
}

//export to room
module.exports = Players;