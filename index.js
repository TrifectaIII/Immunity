// SETUP
///////////////////////////////////////////////////

var express = require('express'); // load express package
var app = express(); //create express app
var serv = require('http').Server(app); //serve http over app
var io = require('socket.io')(serv); // connect socket.io to server


// HTTP SERVER
///////////////////////////////////////////////////

//Start Server
serv.listen(process.env.PORT); // specified port or 8k as backup

//route main page in index
app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});

//Serve static files
app.use('/client',express.static(__dirname + '/client'));


// GAME TOOLS
///////////////////////////////////////////////////

//include gameRoom constructor from gameRoom.js
var gameRoom = require('./gameRoom.js');

//Global Server Settings
var game = {
    //max players per room
    roomCap: 6,

    //space between server updates in MS
    tickRate: 20,

    //width and height of game canvas
    width: 1500,
    height: 1500,

    screenWidth: 600,
    screenHeight: 600,

    // starting health
    health_start: 10,

    //time in MS to respawn
    respawnTime: 3000,

    //players speed
    player_speed: 5,

    //speed of shots
    shot_speed: 15,

    //angle between each shot of full spread
    full_spread_angle:Math.PI/32,

    //lifespan of shots (in ticks)
    shotLifespan: 40,

    //lifespan of full spread
    fullSpreadLifespan: 15,

    //colors for each player to tell them apart
    colors:['blue','yellow','pink','green'],

    colorPairs:{
        'blue':['#29ADFF','#1D2B53'],
        'yellow':['#FFEC27','#AB5236'],
        'pink':['#FF77A8','#7E2553'],
        'green':['#00E436','#008751'],
    },
}

//players component speed when moving @ angle
game.player_speed_angle = game.player_speed/(Math.sqrt(2));

//calculates distance between a player and a shot
function distance(socket, shot) {
    return Math.sqrt(
        Math.pow(socket.x-shot.x, 2) + 
        Math.pow(socket.y-shot.y ,2)
    );
}

//returns random integer between low and high, inclusive
function randint(low,high) {
    if (high > low) {
        return Math.floor(Math.random()*(high+1-low) +low)
    }
    return Math.floor(Math.random()*(low+1-high) +high)
}

function sizeOf (obj) {
    return Object.keys(obj).length;
}

// SOCKET HANDLING
///////////////////////////////////////////////////

//object to hold individual game rooms
var gameRooms = {};


//handle incoming socket connections
io.sockets.on('connection', function (socket) {


    // CONNECTION/DISCONNECT
    ////////////////////////////////

	//log a new connection
	console.log('NEW USER. ID: ',socket.id);
    console.log("Total Players:", Object.keys(io.sockets.connected).length);

    //log a disconnect
    socket.once('disconnect', function () {
        console.log('USER DC. ID: ',socket.id);
        console.log("Total Players:", Object.keys(io.sockets.connected).length);

        //remove from room
        if ('gameCode' in socket) {
            delete gameRooms[socket.gameCode].players[socket.id];
            //if room empty, delete it
            if (sizeOf(gameRooms[socket.gameCode].players) <= 0) {
                delete gameRooms[socket.gameCode];
            }
            // console.log(gameRooms);
        }        
    })

    // JOIN ROOM
    ////////////////////////////////

    //connect socket to room
    socket.on('join_game', function (code) {

        let joined = false;

        //create new room on request
        if (code == 'new_game' || !(code in gameRooms)) {
            let gameCodeCounter = 101
            while (gameCodeCounter.toString() in gameRooms) {
                gameCodeCounter += 1;
            }
            let gameCode = gameCodeCounter.toString();

            socket.gameCode = gameCode;

            socket.join(gameCode);

            gameRooms[gameCode] = {
                shots: {},
                players: {},
            }

            gameRooms[gameCode].players[socket.id] = socket;

            socket.emit('joined',gameCode);

            joined = true;
        }

        //add to room if room has empty space
        else if (code in gameRooms && sizeOf(gameRooms[code].players) < 4) {
            socket.gameCode = code;

            socket.join(code);

            gameRooms[code].players[socket.id] = socket;

            socket.emit('joined',code);

            joined = true;
        }

        //reject socket if room full
        else {
            socket.emit('room_full');
        }

        // FINISH
        ////////////////////////////////

        //flesh socket out if joined
        if (joined) {
            // console.log(gameRooms);

            //relay settings to socket
            socket.emit('game_settings', game)

            socket.color = game.colors[randint(0, game.colors.length-1)]

            socket.spawn = function () {
                socket.x = randint(100,game.width-100);
                socket.y = randint(100,game.height-100);

                socket.health = game.health_start;

                socket.alive = true;
            }

            socket.spawn();

            socket.on('move', function (direction) {
                if (socket.alive) {
                    switch (direction) {
                        case 'rightup':
                            socket.x += game.player_speed_angle;
                            socket.y -= game.player_speed_angle;
                            break;
                        case 'leftup':
                            socket.x -= game.player_speed_angle;
                            socket.y -= game.player_speed_angle;
                            break;
                        case 'rightdown':
                            socket.x += game.player_speed_angle;
                            socket.y += game.player_speed_angle;
                            break;
                        case 'leftdown':
                            socket.x -= game.player_speed_angle;
                            socket.y += game.player_speed_angle;
                            break;
                        case 'right':
                            socket.x += game.player_speed;
                            break;
                        case 'left':
                            socket.x -= game.player_speed;
                            break;
                        case 'up':
                            socket.y -= game.player_speed;
                            break;
                        case 'down':
                            socket.y += game.player_speed;
                            break;
                    }

                    //boundaries
                    socket.x = Math.max(socket.x, 0);
                    socket.x = Math.min(socket.x, game.width);
                    socket.y = Math.max(socket.y, 0);
                    socket.y = Math.min(socket.y, game.height);
                }
            });

            //handle shooting
            socket.on('shoot', function (vel) {
                if (socket.alive) {
                    var id = Math.random();
                    gameRooms[socket.gameCode].shots[id] = {};
                    gameRooms[socket.gameCode].shots[id].x = socket.x;
                    gameRooms[socket.gameCode].shots[id].y = socket.y;
                    gameRooms[socket.gameCode].shots[id].color = socket.color;
                    gameRooms[socket.gameCode].shots[id].socket = socket.id;
                    gameRooms[socket.gameCode].shots[id].velocity = vel;
                    gameRooms[socket.gameCode].shots[id].lifespan = game.shotLifespan;
                }
            });

            //handle full spread
            socket.on('full_spread', function (vels) {
                try {
                    if (socket.alive) {
                        vels.forEach(function (vel) {
                            var id = Math.random();
                            gameRooms[socket.gameCode].shots[id] = {};
                            gameRooms[socket.gameCode].shots[id].x = socket.x;
                            gameRooms[socket.gameCode].shots[id].y = socket.y;
                            gameRooms[socket.gameCode].shots[id].color = socket.color;
                            gameRooms[socket.gameCode].shots[id].socket = socket.id;
                            gameRooms[socket.gameCode].shots[id].velocity = vel;
                            gameRooms[socket.gameCode].shots[id].lifespan = game.fullSpreadLifespan;
                        });
                        if (socket.health > 0) {
                            socket.health -= 1;
                            socket.alive = socket.health > 0;
                            if (!socket.alive) {
                                setTimeout(socket.spawn, game.respawnTime);
                            }
                        }
                    }
                }
                catch (error) {
                    console.log('fullspread failed: ',error)
                }
            });
        }
    });

    
});


// MAIN GAME LOOP
////////////////////////////////////////////////////////

setInterval(function () {
    //loop through each room
    for (let gameCode in gameRooms) {
        let room = gameRooms[gameCode];

        //collect info on players from sockets
        var player_info = {};
        for (let id in room.players) {
            let player = room.players[id]
            player_info[player.id] = {};
            player_info[player.id].x = player.x;
            player_info[player.id].y = player.y;
            player_info[player.id].color = player.color;
            player_info[player.id].health = player.health;
        }

        //handle shots
        var shot_info = {};

        for (let id in room.shots) {
            let shot = room.shots[id];

            //move based on velocity
            shot.x += shot.velocity.x;
            shot.y += shot.velocity.y;

            let destroyed = false;

            // check for collisions with enemies
            for (let id in room.players) {
                let enemy = room.players[id];
                if (enemy.alive && enemy.id != shot.socket && distance(enemy, shot) < 27) {
                    if (enemy.health > 0) {
                        enemy.health -= 1;
                        destroyed = true;
                        enemy.alive = enemy.health > 0;
                        if (!enemy.alive) {
                            setTimeout(enemy.spawn, game.respawnTime)
                        }
                    }
                } 
            }

            //destroy if end of life
            shot.lifespan -= 1;
            destroyed = destroyed || shot.lifespan <= 1;
            
            if (destroyed) {
                delete room.shots[id];
            }

            // collect info on remaining shot
            else {
                shot_info[id] = {};
                shot_info[id].x = shot.x;
                shot_info[id].y = shot.y;
                shot_info[id].color = shot.color;
            }
        }

        //emit to the room
        io.sockets.to(gameCode).emit('game_update', player_info, shot_info);
    }
}, game.tickRate);