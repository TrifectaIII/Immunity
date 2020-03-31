//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////
const gameSettings = require(__dirname + '/gameSettings.js');



//Collision/Physics Functions from Physics.js
///////////////////////////////////////////////////////////////////////////

const Physics = require(__dirname + '/Physics.js');



// object constructor for enemies
function Players (room) {

    //hold individual enemy objects
    this.players = {};

    //save room that object exists in
    this.room = room;
}

//updates all player objects
Players.prototype.update = function () {

    //respawn any dead players
    for (let id in this.players) {
        let player = this.players[id];
        if (player.type != 'none' &&
            !player.respawning &&
            player.health <= 0) {

                //mark as respawning
                player.respawning = true;

                //if game not over, wait for respawn time
                if (!this.room.gameOver) {
                    //set to respawn and choose new class
                    setTimeout(function () {
                        //ask for new class choice on respawn
                        player.type = 'none';
                        player.emit('player_died');
                    }, 
                    //respawn time from settings
                    gameSettings.respawnTime);
                }

                //if game over, do it automatically
                else {
                    player.type = 'none';
                    player.emit('player_died');
                }
        }
    }

    if (!this.room.gameOver) {
        //loop through all players
        for (let id in this.players) {
            let player = this.players[id];

            //do not update if no class chosen
            if (player.type == 'none') {
                continue;
            }

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
                for (let pid in this.players) {
                    if (player.id != pid && 
                        player.type != 'none' &&
                        this.players[pid].health > 0) {
                            Physics.collideAndDisplace(
                                player, 
                                gameSettings.playerTypes[player.type].radius,
                                this.players[pid], 
                                gameSettings.playerTypes[this.players[pid].type].radius
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
    
    let player_info = {};

    for (let id in this.players) {
        let player = this.players[id];
        player_info[id] = {
            x: player.x,
            y: player.y,
            type: player.type,
            health: player.health,
            name: player.name,
            killStreak: player.killStreak,
        };
    }

    return player_info;
}

//request shoot for player if appropriate
Players.prototype.shootRequest = function (player) {

    //make sure alive, clicking, and not on cooldown
    if (player.health > 0 &&
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
    this.players[player.id] = player;
    player.obj_type = "player";
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
            player.type == 'none' &&
            type in gameSettings.playerTypes) {

                //set class
                player.type = type;

                //subtract life
                this.room.livesCount--;
                
                //spawn player in

                //mark as not respawning
                player.respawning = false;

                //give default velocities
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

                //tell player he is spawned
                player.emit('player_spawned');
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
        if (player.health > 0 && player.readyShots > 0) {

            //remove 1 ready shot
            player.readyShots--;

            //create shots
            this.room.shots.spawnShot(player, destX, destY);
        }
    }.bind(this));//bind to scope

    //restart game if client requests and game is over
    player.on('restart_game', function () {
        this.room.reset();
    }.bind(this));//bind to scope
}

//removes player from object
Players.prototype.remove = function (player) {
    if (player.id in this.players) {
        delete this.players[player.id];
    }
}

//resets all players
Players.prototype.reset = function () {
    for (let id in this.players) {
        this.players[id].health = 0;
        this.players[id].type = 'none';
        this.players[id].killStreak = 0;
    }
}

//checks if all players are dead
Players.prototype.allDead = function () {
    for (let id in this.players) {
        if (this.players[id].health > 0) {
            return false;
        }
    }
    return true;
}

//counts players currently in room
Players.prototype.count = function () {
    return Object.keys(this.players).length;
}

module.exports = Players;