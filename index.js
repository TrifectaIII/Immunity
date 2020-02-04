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
const game_width = 600
const game_height = 300

const player_speed = 5
const player_speed_angle = Math.round(player_speed/(Math.sqrt(2)))

const colors = ['blue','red','yellow','green','orange','purple']
var colorStep = 0

function distance(socket1, socket2) {
    return Math.sqrt(
        Math.pow(socket1.x-socket2.x, 2) + 
        Math.pow(socket1.y-socket2.y ,2)
    );
}

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
});

setInterval(function () {
    var player_info = {};

    for (let id in io.sockets.connected) {
        player_info[id] = {};
        player_info[id].x = io.sockets.connected[id].x;
        player_info[id].y = io.sockets.connected[id].y;
        player_info[id].color = io.sockets.connected[id].color;
    }

    io.sockets.emit('server_update', player_info);
},20);