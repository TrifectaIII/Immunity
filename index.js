// NODE SETUP
///////////////////////////////////////////////////

const express = require('express'); // load express package
const app = express(); //create express app
const serv = require('http').Server(app); //serve http over app
const io = require('socket.io')(serv); // connect socket.io to server


// HTTP SERVER
///////////////////////////////////////////////////

//Start Server
serv.listen(process.env.PORT || 8000); // specified port or 8k as backup

//route main page in index
app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});

//Serve static files
app.use('/client',express.static(__dirname + '/client'));


// GAME ROOMS
///////////////////////////////////////////////////

//include gameRoom constructor from gameRoom.js
const gameRoom = require('./gameRoom.js');

//object to hold individual game rooms
var gameRooms = {};

//generates new, currently-unused roomId
function generateRoomId(gameRooms) {
    let roomIdCounter = 101;
    while (roomIdCounter.toString() in gameRooms) {
        roomIdCounter += 1;
    }
    return roomIdCounter.toString();
}

// HANDLE NEW SOCKETS
///////////////////////////////////////////////////
io.sockets.on('connection', function (socket) {


    // CONNECTION/DISCONNECT
    ////////////////////////////////

	//log a new connection
	console.log('NEW USER. ID: ',socket.id);
    console.log("Total Players:", Object.keys(io.sockets.connected).length);

    
    socket.once('disconnect', function () {

        //log a disconnect
        console.log('USER DC. ID: ',socket.id);
        console.log("Total Players:", Object.keys(io.sockets.connected).length);

        //remove from room if in one
        if ('roomId' in socket) {
            gameRooms[socket.roomId].removeSocket(socket);
            //shut down and delete room if empty
            if (gameRooms[socket.roomId].isEmpty()) {
                gameRooms[socket.roomId].shutdownRoom();
                delete gameRooms[socket.roomId];
            }
        }     
    })

    // JOIN ROOM
    ////////////////////////////////

    //connect socket to room
    socket.once ('join_game', function (roomId, name) {

        //set name of socket
        socket.name = name.substring(0,6);

        //create new room on request
        if (roomId == 'new_game') {
            //generate new room id
            let newRoomId = generateRoomId(gameRooms);
            
            //create room object
            gameRooms[newRoomId] = new gameRoom.Room(newRoomId);

            //place socket into room
            gameRooms[newRoomId].addSocket(socket);
        }

        //add to room if room exists and has space
        else if (roomId in gameRooms && gameRooms[roomId].hasSpace()) {
            gameRooms[roomId].addSocket(socket);
        }

        //reject socket if room full
        else if (roomId in gameRooms) {
            socket.emit('room_full');
        }

        //reject socket if no such room
        else {
            socket.emit('no_such_room');
        }
    });
});

// MAIN GAME LOOP
///////////////////////////////////////////////////

setInterval(function () {
    //update each room in turn and emit results to players
    for (let roomId in gameRooms) {
        let game_info = gameRooms[roomId].update();
        io.to(roomId).emit('game_update', game_info);
    }
//frequency set by game settings in gameRoom.js
}, gameRoom.settings.tickRate);