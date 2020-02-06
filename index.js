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

//Global Server Settings
var game = {
    //width and height of game canvas
    width: 600,
    height: 600,

    // starting health
    health_start: 3,

    //players speed
    player_speed: 5,

    //speed of shots
    shot_speed: 15,

    //angle between each shot of full spread
    full_spread_angle:Math.PI/32,

    //colors for each player to tell them apart
    colors:['blue','yellow','pink','green'],

    colorPairs:{
        'blue':['#29ADFF','#1D2B53'],
        'yellow':['#FFEC27','#FFA300'],
        'pink':['#FF77A8','#7E2553'],
        'green':['#00E436','#008751'],
    },
}

//keeps track of which color is next
game.colorStep = 0;

//players component speed when moving @ angle
game.player_speed_angle = Math.round(game.player_speed/(Math.sqrt(2)));

//calculates distance between a player and a shot
function distance(socket, shot) {
    return Math.sqrt(
        Math.pow(socket.x-shot.x, 2) + 
        Math.pow(socket.y-shot.y ,2)
    );
}

//object to hold info re: shots
var shots = {};

// SOCKET HANDLING
///////////////////////////////////////////////////

//handle incoming socket connections
io.sockets.on('connection', function (socket) {

	//log a new connection
	console.log('NEW USER. ID: ',socket.id);
    console.log("Total Players:", Object.keys(io.sockets.connected).length);

    socket.once('disconnect', function () {
        console.log('USER DC. ID: ',socket.id);
        console.log("Total Players:", Object.keys(io.sockets.connected).length);
    })

    socket.emit('game_settings', game)

    socket.color = game.colors[game.colorStep]
    game.colorStep += 1
    if (game.colorStep >= game.colors.length) {
        game.colorStep = 0
    }

    socket.x = game.width/2;
    socket.y = game.height/2;

    socket.health = game.health_start;

    socket.on('move', function (direction) {
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
    });

    //handle shooting
    socket.on('shoot', function (vel) {
        var id = Math.random();
        shots[id] = {};
        shots[id].x = socket.x;
        shots[id].y = socket.y;
        shots[id].color = socket.color;
        shots[id].socket = socket.id;
        shots[id].velocity = vel;
    });

    socket.on('full_spread', function (vels) {
        vels.forEach(function (vel) {
            var id = Math.random();
            shots[id] = {};
            shots[id].x = socket.x;
            shots[id].y = socket.y;
            shots[id].color = socket.color;
            shots[id].socket = socket.id;
            shots[id].velocity = vel;
        });
    });
});

setInterval(function () {

    //collect info on players from sockets
    var player_info = {};
    for (let id in io.sockets.connected) {
        player_info[id] = {};
        player_info[id].x = io.sockets.connected[id].x;
        player_info[id].y = io.sockets.connected[id].y;
        player_info[id].color = io.sockets.connected[id].color;
        player_info[id].health = io.sockets.connected[id].health;
    }

    var shot_info  = {};

    //move shots automatically
    for (let id in shots) {
        shots[id].x += shots[id].velocity.x;
        shots[id].y += shots[id].velocity.y;

        let destroyed = false;

        // check for collisions with enemies
        for (let player in io.sockets.connected) {
            let socket = io.sockets.connected[player]
            if (player != shots[id]. socket && distance(socket, shots[id]) < 27) {
                io.sockets.connected[player].health -= 1;
                destroyed = true;
            } 
        }

        // destroy shots if they get too far off track
        if (shots[id].x < 0 ||
            shots[id].x > game.width ||
            shots[id].y < 0 ||
            shots[id].y > game.height) {
                destroyed = true;
        }
        
        if (destroyed) {
            delete shots[id];
        }

        // collect info on remaining shots
        else {
            shot_info[id] = {};
            shot_info[id].x = shots[id].x;
            shot_info[id].y = shots[id].y;
            shot_info[id].color = shots[id].color;
        }
    }

    //send data to all sockets
    io.sockets.emit('server_update', player_info, shot_info);
},20);