//Global Server Settings
///////////////////////////////////////////

var game = {
    //max players per room
    roomCap: 6,

    //space between server updates in MS
    tickRate: 20,

    //size of game area
    width: 3000,
    height: 3000,

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

    //angle between each shot of full spread
    fullSpreadAngle: Math.PI/16,

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

//calculates distance
function distance(socket, shot) {
    return Math.sqrt(
        Math.pow(socket.x-shot.x, 2) + 
        Math.pow(socket.y-shot.y ,2)
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

//function which spawns or respawns a socket
function spawnSocket(socket,game) {
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

// ROOM CONSTRUCTOR
///////////////////////////////////////////

//constructor for room objects
function Room (roomId) {
    this.roomId = roomId;
    this.players = {};
    this.shots = {};
}

//updates room for update loop
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
                    if (enemy.health > 0) {
                        enemy.health -= 1;
                        destroyed = true;
                        enemy.alive = enemy.health > 0;
                        if (!enemy.alive) {
                            this.players[shot.socketId].killStreak += 1;
                            setTimeout(function () {
                                spawnSocket(enemy, game);
                            }, game.respawnTime)
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
    }
}

//add a socket if space available
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
        spawnSocket(socket, game);

        //SET UP LISTENERS
        /////////////////////////////////

        //save room context for listeners
        let room = this;

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

                //Loop through each enemy player after moving
                for (let id in room.players) {
                    if (id != socket.id) {
                        let enemySocket = room.players[id];
                        //DO BALL COLLISION HERE
                        //use game.playerRadius to access radius
                        
                    }
                }

                //boundaries
                socket.x = Math.min(Math.max(socket.x, 0), game.width);
                socket.y = Math.min(Math.max(socket.y, 0), game.height);
            }
        });

        //handle shooting
        socket.on('shoot', function (dest_x, dest_y) {
            if (socket.alive) {
                //calculate velocity based on shot speed and where the player clicked
                vel = velocity(angle(socket.x, socket.y, dest_x, dest_y));

                //create new shot object
                var id = Math.random();
                room.shots[id] = {};
                room.shots[id].x = socket.x;
                room.shots[id].y = socket.y;
                room.shots[id].color = socket.color;
                room.shots[id].socketId = socket.id;
                room.shots[id].velocity = vel;
                room.shots[id].lifespan = game.shotLifespan;
            }
        });

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
                        + (i - game.fullSpreadCount/2 + 0.5) * game.fullSpreadAngle
                    );

                    var id = Math.random();
                    room.shots[id] = {};
                    room.shots[id].x = socket.x;
                    room.shots[id].y = socket.y;
                    room.shots[id].color = socket.color;
                    room.shots[id].socketId = socket.id;
                    room.shots[id].velocity = vel;
                    room.shots[id].lifespan = game.fullSpreadLifespan;
                }
            }
        });
    }
}

//remove socket if socket exists in room
Room.prototype.removeSocket = function (socket) {
    if (socket.id in this.players) {
        delete this.players[socket.id];
    }
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


//allow for import into index.js
module.exports = {
    Room:Room,
    settings:game,
}