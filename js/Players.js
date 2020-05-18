//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require(__dirname + '/gameSettings.js');


//Collision/Physics Functions from Physics.js
///////////////////////////////////////////////////////////////////////////

const Physics = require(__dirname + '/Physics.js');



// object constructor for enemies
function Players (room) {

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
Players.prototype.update = function () {

    //respawn any dead players
    for (let id in this.playing) {
        let player = this.playing[id];
        if (!player.respawning &&
            player.health <= 0) {

                //mark as respawning
                player.respawning = true;

                //if game not over, wait for respawn time
                if (!this.room.gameOver) {

                    //set to respawn and choose new class
                    setTimeout(function () {
                        //move player to waiting
                        this.waitPlayer(player);
                    }.bind(this), //bind to object scope

                    //respawn time from settings
                    gameSettings.respawnTime);
                }

                //if game over, do it now
                else {
                    //move player to waiting
                    this.waitPlayer(player);
                }
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

                //acceleration is set by class
                let acceleration = gameSettings.playerTypes[player.type].acceleration;
                let accelerationComponent = acceleration/(Math.sqrt(2));

                //accelerate based on direction sent by client
                switch (player.direction) {
                    
                    //degrade velocities when no direction
                    case 'none':
                        player.velocity.x *= 0.95;
                        player.velocity.y *= 0.95;

                        //if slow enough, stop
                        if (
                            Math.abs(player.velocity.x) < 0.1) {
                            player.velocity.x = 0;
                        }
                        if (Math.abs(player.velocity.y) < 0.1) {
                            player.velocity.y = 0;
                        }
                        break;

                    
                    //diagonal movements use component acceleration
                    case 'rightup':
                        player.velocity.x += accelerationComponent;
                        player.velocity.y -= accelerationComponent;
                        break;
                    case 'leftup':
                        player.velocity.x -= accelerationComponent;
                        player.velocity.y -= accelerationComponent;
                        break;
                    case 'rightdown':
                        player.velocity.x += accelerationComponent;
                        player.velocity.y += accelerationComponent;
                        break;
                    case 'leftdown':
                        player.velocity.x -= accelerationComponent;
                        player.velocity.y += accelerationComponent;
                        break;
                    
                    //cardinal movements use raw acceleration
                    //and degrade unused velocity
                    case 'right':
                        player.velocity.x += acceleration;
                        player.velocity.y *= 0.95;
                        if (Math.abs(player.velocity.y) < 0.1) {
                            player.velocity.y = 0;
                        }
                        break;
                    case 'left':
                        player.velocity.x -= acceleration;
                        player.velocity.y *= 0.95;
                        if (Math.abs(player.velocity.y) < 0.1) {
                            player.velocity.y = 0;
                        }
                        break;
                    case 'up':
                        player.velocity.y -= acceleration;
                        player.velocity.x *= 0.95;
                        if (
                            Math.abs(player.velocity.x) < 0.1) {
                            player.velocity.x = 0;
                        }
                        break;
                    case 'down':
                        player.velocity.y += acceleration;
                        player.velocity.x *= 0.95;
                        if (
                            Math.abs(player.velocity.x) < 0.1) {
                            player.velocity.x = 0;
                        }
                        break;
                }

                //cap velocity
                Physics.capVelocity(player, gameSettings.playerTypes[player.type].maxVelocity);

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
                                gameSettings.playerTypes[player.type].radius,
                                otherPlayer, 
                                gameSettings.playerTypes[otherPlayer.type].radius
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
Players.prototype.collect = function () {

    let playing_info = {};

    for (let id in this.playing) {
        let player = this.playing[id];
        playing_info[id] = {
            x: player.x,
            y: player.y,
            type: player.type,
            health: player.health,
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
            health: player.health,
            name: player.name,
            killStreak: player.killStreak,
        };
    }

    return {
        playing: playing_info,
        waiting: waiting_info,
    };
}

//request shoot for player if appropriate
Players.prototype.shootRequest = function (player) {

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
            player.cooldown = gameSettings.playerTypes[player.type].shots.cooldown;
    }
}

//add new player
Players.prototype.add = function (player) {

    //add to players object
    this.objects[player.id] = player;

    //add to waiting object
    this.waitPlayer(player);

    //give default class
    player.type = 'none';

    //mark as not respawning
    player.respawning = false;

    //give no health
    player.health = 0;

    //start killStreak at 0
    player.killStreak = 0;

    //give default direction
    player.direction = 'none';

    //give default location
    player.x = 0;
    player.y = 0;

    //give default velocities
    player.velocity = {
        x: 0,
        y: 0,
    }

    //give default click value
    player.clicking = false;

    //start with no shooting cooldown
    player.cooldown = 0;

    //start with no ready shots
    player.readyShots = 0;

    //SET UP LISTENERS
    /////////////////////////////////

    //set class based on player choice
    player.on ('class_choice', function (type) {
        //only change if valid choice and a life exists
        if (this.room.livesCount > 0 &&
            player.id in this.waiting &&
            type in gameSettings.playerTypes) {

                //set class
                player.type = type;

                //subtract life
                this.room.livesCount--;

                //mark as not respawning
                player.respawning = false;


                //give default direction & velocities
                player.direction = 'none';
                player.velocity = {
                    x: 0,
                    y: 0,
                }
                
                //give random position in world
                player.x = Math.floor(Math.random() * (gameSettings.width-200+1)) + 100;
                player.y = Math.floor(Math.random() * (gameSettings.height-200+1)) + 100;

                //give max health based on 
                player.health = gameSettings.playerTypes[player.type].maxHealth;

                //reset killstreak
                player.killStreak = 0;

                //move to playing object
                this.playPlayer(player);
        }
    }.bind(this));//bind to scope

    //switch player direction
    player.on('direction', function (direction) {
        player.direction = direction;
    });

    //switch clicking state
    player.on('click', function (clicking) {
        player.clicking = clicking;
        //request shoot right away to avoid a click getting clipped by tickRate
        this.shootRequest(player);
    }.bind(this));//bind to scope

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
    }.bind(this));//bind to scope

    //restart game if client requests
    player.on('restart_game', function () {
        this.room.reset();
    }.bind(this));//bind to scope
}

//moves player to waiting object
Players.prototype.waitPlayer = function (player) {
    if (player.id in this.objects) {
        this.waiting[player.id] = player;
        delete this.playing[player.id];
    }
}

//moves player to playing object
Players.prototype.playPlayer = function (player) {
    if (player.id in this.objects) {
        this.playing[player.id] = player;
        delete this.waiting[player.id];
    }
}

//removes player from object
Players.prototype.remove = function (player) {
    if (player.id in this.objects) {
        delete this.objects[player.id];
        delete this.playing[player.id];
        delete this.waiting[player.id];
    }
}

//resets all players
Players.prototype.reset = function () {
    for (let id in this.objects) {
        this.objects[id].health = 0;
        this.objects[id].type = 'none';
        this.objects[id].killStreak = 0;

        //move to waiting object
        this.waitPlayer(this.objects[id]);
    }
}

//checks if all players are dead
Players.prototype.allDead = function () {
    for (let id in this.objects) {
        if (this.objects[id].health > 0) {
            return false;
        }
    }
    return true;
}

//counts players currently in room
Players.prototype.count = function () {
    return Object.keys(this.objects).length;
}

//counts players currently in room & playing
Players.prototype.playingCount = function () {
    return Object.keys(this.playing).length;
}

//counts players currently in room & waiting
Players.prototype.waitingCount = function () {
    return Object.keys(this.waiting).length;
}

module.exports = Players;