//Global Server Settings from gameSettings.js
///////////////////////////////////////////

const gameSettings = require('./gameSettings.js');

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

//calculates component velocities of shot based on angle and net speed
function velocity(ang, speed) {
    return {
        x:Math.sin(ang) * speed,
        y:Math.cos(ang) * speed,
    };
}

// ROOM CONSTRUCTOR
///////////////////////////////////////////

//constructor for room objects
function Room (roomId) {

    this.roomId = roomId;

    //hold info about game objects
    this.players = {};
    this.shots = {};
    this.pickups = {};
    // this.enemies = {}; //enemies not implemented yet

    //spawn a health every X ms
    this.pickupSpawner = setInterval(
        this.spawnPickups.bind(this), //bind to room scope
        gameSettings.pickupTime //interval from game settings
    );
}

// ROOM UPDATE
///////////////////////////////////////////
//called every gameSettings.tickRate ms in index.js
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
                distance(enemy, shot) < gameSettings.playerRadius) {
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
                            }.bind(this), gameSettings.respawnTime);
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
    if (this.getPop() < gameSettings.roomCap) {

        //add to players object
        this.players[socket.id] = socket;

        //join socketio room
        socket.join(this.roomId);

        //set roomId to socket
        socket.roomId = this.roomId;

        //give socket a random color
        socket.color = Object.keys(gameSettings.colorPairs)[randint(0, Object.keys(gameSettings.colorPairs).length-1)];

        //spawn socket for first time
        this.spawnSocket(socket);

        //SET UP LISTENERS
        /////////////////////////////////

        //lets player move 
        socket.on('move', function (direction) {
            if (socket.alive) {
                switch (direction) {
                    //diagonal movements use component speed
                    case 'rightup':
                        socket.x += gameSettings.playerSpeedAngle;
                        socket.y -= gameSettings.playerSpeedAngle;
                        break;
                    case 'leftup':
                        socket.x -= gameSettings.playerSpeedAngle;
                        socket.y -= gameSettings.playerSpeedAngle;
                        break;
                    case 'rightdown':
                        socket.x += gameSettings.playerSpeedAngle;
                        socket.y += gameSettings.playerSpeedAngle;
                        break;
                    case 'leftdown':
                        socket.x -= gameSettings.playerSpeedAngle;
                        socket.y += gameSettings.playerSpeedAngle;
                        break;
                    //cardinal movements use raw speed
                    case 'right':
                        socket.x += gameSettings.playerSpeed;
                        break;
                    case 'left':
                        socket.x -= gameSettings.playerSpeed;
                        break;
                    case 'up':
                        socket.y -= gameSettings.playerSpeed;
                        break;
                    case 'down':
                        socket.y += gameSettings.playerSpeed;
                        break;
                }

                // //Loop through each enemy player after moving
                // for (let id in this.players) {
                //     if (id != socket.id) {
                //         let enemySocket = this.players[id];
                //         //DO BALL COLLISION HERE
                //         //use gameSettings.playerRadius to access radius
                        
                //     }
                // }

                //boundaries
                socket.x = Math.min(Math.max(socket.x, 0), gameSettings.width);
                socket.y = Math.min(Math.max(socket.y, 0), gameSettings.height);
            }
        }.bind(this));//bind to room scope

        //handle shooting
        socket.on('shoot', function (dest_x, dest_y) {
            if (socket.alive) {
                //calculate velocity based on shot speed and where the player clicked
                vel = velocity(
                    angle(socket.x, socket.y, dest_x, dest_y), 
                    gameSettings.shotSpeed
                );

                //create new shot object
                var id = Math.random();
                this.shots[id] = {};
                this.shots[id].x = socket.x;
                this.shots[id].y = socket.y;
                this.shots[id].color = socket.color;
                this.shots[id].socketId = socket.id;
                this.shots[id].velocity = vel;
                this.shots[id].lifespan = gameSettings.shotLifespan;
            }
        }.bind(this));//bind to room scope

        //handle full spread
        socket.on('full_spread', function (dest_x, dest_y) {
            if (socket.alive) {
                //calculate velocity for each shot in spread, based on 
                // pellet count and angle
                for (let i = 0; i < gameSettings.fullSpreadCount; i++) {

                    let vel = velocity(
                        angle(
                            socket.x, socket.y, 
                            dest_x, dest_y
                        ) 
                        + (i - gameSettings.fullSpreadCount/2 + 0.5) 
                        * (gameSettings.fullSpreadAngle/(gameSettings.fullSpreadCount-1)),
                        gameSettings.shotSpeed
                    );

                    var id = Math.random();
                    this.shots[id] = {};
                    this.shots[id].x = socket.x;
                    this.shots[id].y = socket.y;
                    this.shots[id].color = socket.color;
                    this.shots[id].socketId = socket.id;
                    this.shots[id].velocity = vel;
                    this.shots[id].lifespan = gameSettings.fullSpreadLifespan;
                }
            }
        }.bind(this));//bind to room scope

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
                if (closestDistance <= gameSettings.playerRadius + 10) {
                    switch (this.pickups[closestId].type) {
                        //health pickup gives 5 hp, up to max
                        case "health":
                            socket.health = Math.min(gameSettings.maxHealth, socket.health + 5);
                            break;
                    }
                    //delete after use
                    delete this.pickups[closestId];
                }
            }
        }.bind(this));

        //confirm join with server after socket totally set up
        socket.emit('joined',this.roomId);
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
    socket.x = randint(100,gameSettings.width-100);
    socket.y = randint(100,gameSettings.height-100);

    //give max health
    socket.health = gameSettings.maxHealth;

    //reset killstreak
    socket.killStreak = 0;

    //set to alive
    socket.alive = true;
}

//spawns pickups into the room based on # of players
Room.prototype.spawnPickups = function () {
    for (
        let i=0; 
        //try to make 1 for every current player
        i < this.getPop() && 
        //loop should break if cap is hit (population * pickupMax)
        Object.keys(this.pickups).length < this.getPop() * gameSettings.pickupMax;
        i++) {
            let id = Math.random();
            this.pickups[id] = {
                //choose a random type from the settings list
                type: gameSettings.pickupTypes[randint(0, gameSettings.pickupTypes.length-1)],
                x: randint(100, gameSettings.width-100),
                y: randint(100, gameSettings.height-100),
            }
    } 
}

//stops timing events for the room
Room.prototype.shutdown = function () {
    clearInterval(this.pickupSpawner);
}

//get current population of room
Room.prototype.getPop = function () {
    return Object.keys(this.players).length;
}

//checks if room has space
Room.prototype.hasSpace = function () {
    return this.getPop() < gameSettings.roomCap;
}

//checks if room is empty
Room.prototype.isEmpty = function () {
    return this.getPop() == 0;
}


// EXPORTS CONSTRCTOR TO index.js
///////////////////////////////////////////
module.exports = Room;