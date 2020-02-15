//Global Server Settings
///////////////////////////////////////////

var game = {
    //max players per room
    roomCap: 6,

    //space between server updates in MS
    tickRate: 20,

    //size of game area
    width: 1000,
    height: 1000,

    // starting health for players
    maxHealth: 10,

    // time in MS to respawn players
    respawnTime: 3000,

    //players speed
    playerSpeed: 5,

    //size of player
    playerRadius: 25,

    //speed of shots + full spread
    shotSpeed: 15,

    //lifespan of shots (in ticks)
    shotLifespan: 40,

    //lifespan of full spread (in ticks)
    fullSpreadLifespan: 15,

    //number of shots per full spread
    fullSpreadCount: 3,

    //angle between edge shots in full spread
    fullSpreadAngle: Math.PI/6,

    //time between spawns of pickups in ms
    pickupTime: 5000,

    //max pickups in the world at a time, per player
    pickupMax: 4,

    //colors for each player to tell them apart
    colorPairs:{
        'blue':['#29ADFF','#1D2B53'],
        'yellow':['#FFEC27','#AB5236'],
        'pink':['#FF77A8','#7E2553'],
        'green':['#00E436','#008751'],
    },
}

//players component speed when moving @ angle
game.playerSpeedAngle = game.playerSpeed/(Math.sqrt(2));


// Helper Functions
///////////////////////////////////////////

//returns random integer between low and high, inclusive
function randint(low,high) {
    if (high > low) {
        return Math.floor(Math.random()*(high+1-low) +low);
    }
    return Math.floor(Math.random()*(low+1-high) +high);
}

//calculates distance between 2 objects with x and y attributes
function distance(obj1, obj2) {
    return Math.sqrt(
        Math.pow(obj1.x-obj2.x, 2) + 
        Math.pow(obj1.y-obj2.y ,2)
    );
}

//calculates angle of vector between player position and shot destination
function angle(x, y, dest_x, dest_y) {
    return Math.atan2(dest_x - x, dest_y - y);
}

//calculates component velocities of shot based on velocity and angle
function velocity(ang) {
    return {
        x:Math.sin(ang) * game.shotSpeed,
        y:Math.cos(ang) * game.shotSpeed,
    };
}

// ROOM CONSTRUCTOR
///////////////////////////////////////////

//constructor for room objects
function Room (roomId) {

    this.roomId = roomId;

    this.players = {};
    this.shots = {};
    this.pickups = {};

    //spawn a health every X ms
    this.pickupSpawner = setInterval(function () {
        this.spawnPickups('health');
    }.bind(this), game.pickupTime);

    //enemies not implemented yet
    // this.enemies = {};
}

// ROOM UPDATE
///////////////////////////////////////////
Room.prototype.update = function () {

    //handle shots
    var shot_info = {};

    for (let id in this.shots) {
        let shot = this.shots[id];

        //move based on velocity
        shot.x += shot.velocity.x;
        shot.y += shot.velocity.y;

        let destroyed = false;

        // check for collisions with enemies
        for (let id in this.players) {
            let enemy = this.players[id];
            if (enemy.alive && 
                enemy.id != shot.socketId && 
                distance(enemy, shot) < game.playerRadius) {
                    //remove health
                    if (enemy.health > 0) {
                        enemy.health -= 1;
                        destroyed = true;
                        //if enemy dead, set to respawn
                        enemy.alive = enemy.health > 0;
                        if (!enemy.alive) {
                            this.players[shot.socketId].killStreak += 1;
                            setTimeout(function () {
                                this.spawnSocket(enemy);
                            }.bind(this), game.respawnTime);
                        }
                    }
            } 
        }

        //destroy if end of life
        shot.lifespan -= 1;
        destroyed = destroyed || shot.lifespan <= 1;
        
        if (destroyed) {
            delete this.shots[id];
        }

        // collect info on remaining shots
        else {
            shot_info[id] = {
                x: shot.x,
                y: shot.y,
                color: shot.color,
            };
        }
    }

    //collect info on players from sockets
    var player_info = {};

    for (let id in this.players) {
        let player = this.players[id];
        player_info[id] = {
            x: player.x,
            y: player.y,
            color: player.color,
            health: player.health,
            name: player.name,
            killStreak: player.killStreak,
        };
    }

    //return player and shot object for emit to players
    return {
        player_info: player_info,
        shot_info: shot_info,
        pickup_info: this.pickups,
    }
}

// ADD SOCKET TO ROOM AND SET IT UP
///////////////////////////////////////////
Room.prototype.addSocket = function (socket) {
    if (this.getPop() < game.roomCap) {

        //add to players object
        this.players[socket.id] = socket;

        //join socketio room
        socket.join(this.roomId);

        //set roomId to socket
        socket.roomId = this.roomId;

        //confirm join with server
        socket.emit('joined',this.roomId);

        //relay game settings to socket
        socket.emit('game_settings', game)

        //give socket a random color
        socket.color = Object.keys(game.colorPairs)[randint(0, Object.keys(game.colorPairs).length-1)];

        //spawn socket for first time
        this.spawnSocket(socket);

        //SET UP LISTENERS
        /////////////////////////////////

        //lets player move 
        socket.on('move', function (direction) {
            if (socket.alive) {
                switch (direction) {
                    case 'rightup':
                        socket.x += game.playerSpeedAngle;
                        socket.y -= game.playerSpeedAngle;
                        break;
                    case 'leftup':
                        socket.x -= game.playerSpeedAngle;
                        socket.y -= game.playerSpeedAngle;
                        break;
                    case 'rightdown':
                        socket.x += game.playerSpeedAngle;
                        socket.y += game.playerSpeedAngle;
                        break;
                    case 'leftdown':
                        socket.x -= game.playerSpeedAngle;
                        socket.y += game.playerSpeedAngle;
                        break;
                    case 'right':
                        socket.x += game.playerSpeed;
                        break;
                    case 'left':
                        socket.x -= game.playerSpeed;
                        break;
                    case 'up':
                        socket.y -= game.playerSpeed;
                        break;
                    case 'down':
                        socket.y += game.playerSpeed;
                        break;
                }

                // //Loop through each enemy player after moving
                // for (let id in this.players) {
                //     if (id != socket.id) {
                //         let enemySocket = this.players[id];
                //         //DO BALL COLLISION HERE
                //         //use game.playerRadius to access radius
                        
                //     }
                // }

                //boundaries
                socket.x = Math.min(Math.max(socket.x, 0), game.width);
                socket.y = Math.min(Math.max(socket.y, 0), game.height);
            }
        }.bind(this));

        //handle shooting
        socket.on('shoot', function (dest_x, dest_y) {
            if (socket.alive) {
                //calculate velocity based on shot speed and where the player clicked
                vel = velocity(angle(socket.x, socket.y, dest_x, dest_y));

                //create new shot object
                var id = Math.random();
                this.shots[id] = {};
                this.shots[id].x = socket.x;
                this.shots[id].y = socket.y;
                this.shots[id].color = socket.color;
                this.shots[id].socketId = socket.id;
                this.shots[id].velocity = vel;
                this.shots[id].lifespan = game.shotLifespan;
            }
        }.bind(this));

        //handle full spread
        socket.on('full_spread', function (dest_x, dest_y) {
            if (socket.alive) {
                //calculate velocity for each shot in spread, based on 
                // pellet count and angle
                for (let i = 0; i < game.fullSpreadCount; i++) {

                    let vel = velocity(
                        angle(
                            socket.x, socket.y, 
                            dest_x, dest_y
                        ) 
                        + (i - game.fullSpreadCount/2 + 0.5) 
                        * (game.fullSpreadAngle/(game.fullSpreadCount-1))
                    );

                    var id = Math.random();
                    this.shots[id] = {};
                    this.shots[id].x = socket.x;
                    this.shots[id].y = socket.y;
                    this.shots[id].color = socket.color;
                    this.shots[id].socketId = socket.id;
                    this.shots[id].velocity = vel;
                    this.shots[id].lifespan = game.fullSpreadLifespan;
                }
            }
        }.bind(this));

        //handle pickup command 
        socket.on('pickup', function () {
            if (socket.alive) {
                //loop through pickups and find closest
                let closestDistance = Infinity;
                let closestId = 0;
                for (let id in this.pickups) {
                    let thisDistance = distance(this.pickups[id], socket);
                    if (thisDistance < closestDistance) {
                        closestDistance = thisDistance;
                        closestId = id;
                    }
                }
                //if pickup is close enough, consume it.
                if (closestDistance <= game.playerRadius + 10) {
                    switch (this.pickups[closestId].type) {
                        //health pickup gives 5 hp, up to max
                        case "health":
                            socket.health = Math.min(game.maxHealth, socket.health + 5);
                            break;
                    }
                    //delete after use
                    delete this.pickups[closestId];
                }
            }
        }.bind(this));
    }
}

// OTHER ROOM METHODS
///////////////////////////////////////////

//remove socket if socket exists in room
Room.prototype.removeSocket = function (socket) {
    if (socket.id in this.players) {
        delete this.players[socket.id];
    }
}

//spawns or respawns a player
Room.prototype.spawnSocket = function (socket) {
    //give random position in world
    socket.x = randint(100,game.width-100);
    socket.y = randint(100,game.height-100);

    //give max health
    socket.health = game.maxHealth;

    //reset killstreak
    socket.killStreak = 0;

    //set to alive
    socket.alive = true;
}

Room.prototype.spawnPickups = function (type) {
    //try to make 1 pickup for every current player
    for (let i=0; i < this.getPop(); i++) {
        //max pickups is population * pickupMax
        if (Object.keys(this.pickups).length < this.getPop() * game.pickupMax){
            let id = Math.random();
            this.pickups[id] = {
                type: type,
                x: randint(100, game.width-100),
                y: randint(100, game.height-100),
            }
        } 
        else {break;}
    }
}

//stops timing events for the room
Room.prototype.shutdownRoom = function () {
    clearInterval(this.pickupSpawner);
}

//get current population of room
Room.prototype.getPop = function () {
    return Object.keys(this.players).length;
}

//checks if room has space
Room.prototype.hasSpace = function () {
    return this.getPop() < game.roomCap;
}

//checks if room is empty
Room.prototype.isEmpty = function () {
    return this.getPop() == 0;
}


// EXPORTS TO index.js
///////////////////////////////////////////
module.exports = {
    Room:Room, // room objects
    settings:game, // game settings
}