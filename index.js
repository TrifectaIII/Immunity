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


//Global Game Variables
//width and height of game canvas
const game_width = 750
const game_height = 750

// starting health
const health_start = 3;

//players speed
const player_speed = 5
//players component speed when moving @ angle
const player_speed_angle = Math.round(player_speed/(Math.sqrt(2)))

//speed of shots
const shot_speed = 20

//colors for each player to tell them apart
const colors = ['blue','red','yellow','green','orange','purple']
var colorStep = 0

//calculates distance between a player and a shot
function distance(socket, shot) {
    return Math.sqrt(
        Math.pow(socket.x-shot.x, 2) + 
        Math.pow(socket.y-shot.y ,2)
    );
}

//calculates component velocities of shot based on velocity and destination coordinates
function velocity(x, y, dest_x, dest_y) {
    var angle = Math.atan2(dest_x - x, dest_y - y);
    return {x:Math.sin(angle) * shot_speed,
            y:Math.cos(angle) * shot_speed};
}

var shots = {};

// SOCKET HANDLING
///////////////////////////////////////////////////

//handle incoming socket connections
io.sockets.on('connection', function (socket) {

	//log a new connection
	console.log('NEW USER. ID: ',socket.id);
    console.log(Object.keys(io.sockets.connected));

    socket.on('disconnect', function () {
        console.log('USER DC. ID: ',socket.id);
        console.log(Object.keys(io.sockets.connected));
    })

    socket.color = colors[colorStep]
    colorStep += 1
    if (colorStep >= colors.length) {
        colorStep = 0
    }

    socket.x = game_width/2;
    socket.y = game_height/2;

    socket.health = health_start;

    socket.on('move', function (direction) {
        switch (direction) {
            case 'rightup':
                socket.x += player_speed_angle;
                socket.y -= player_speed_angle;
                break;
            case 'leftup':
                socket.x -= player_speed_angle;
                socket.y -= player_speed_angle;
                break;
            case 'rightdown':
                socket.x += player_speed_angle;
                socket.y += player_speed_angle;
                break;
            case 'leftdown':
                socket.x -= player_speed_angle;
                socket.y += player_speed_angle;
                break;
            case 'right':
                socket.x += player_speed;
                break;
            case 'left':
                socket.x -= player_speed;
                break;
            case 'up':
                socket.y -= player_speed;
                break;
            case 'down':
                socket.y += player_speed;
                break;
        }

        //boundaries
        if (socket.x < 0) {
            socket.x = 0
        }
        else if (socket.x > game_width) {
            socket.x = game_width;
        }
        if (socket.y < 0) {
            socket.y = 0
        }
        else if (socket.y > game_height) {
            socket.y = game_height;
        }
    });

    //handle shooting
    socket.on('shoot', function (dest_x, dest_y) {
        var id = Math.random();
        shots[id] = {};
        shots[id].x = socket.x;
        shots[id].y = socket.y;
        shots[id].color = socket.color;
        shots[id].socket = socket.id;
        shots[id].velocity = velocity(socket.x, socket.y, dest_x, dest_y);
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
            shots[id].x > game_width ||
            shots[id].y < 0 ||
            shots[id].y > game_height) {
                destroyed = true;
        }
        
        if (destroyed) {
            delete shots[id]
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