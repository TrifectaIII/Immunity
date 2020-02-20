// NODE SETUP
///////////////////////////////////////////////////

const express = require('express'); // load express package
const app = express(); //create express app
const serv = require('http').Server(app); //serve http over app
const io = require('socket.io')(serv); // connect socket.io to server

//compress and minify files

app.use(require('compression')());

// dont use minification during testing
// app.use(require('express-minify')());

// HTTP SERVER
///////////////////////////////////////////////////

//Start Server
serv.listen(process.env.PORT || 8000); // specified port or 8k as backup

//route main page to index.html
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});

//Serve client files
app.use('/client',express.static(__dirname + '/client'));

//Serve gameSettings.js file
app.get('/gameSettings.js', function (req, res) {
    res.sendFile(__dirname + '/gameSettings.js');
});


// GAME ROOMS
///////////////////////////////////////////////////

//include gameSettings.js
const gameSettings = require(__dirname + '/gameSettings.js');

//include gameRoom constructor from gameRoom.js
const gameRoom = require(__dirname + '/gameRoom.js');

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

//logs current rooms and their populations
function showRooms (gameRooms) {
    console.log("ROOM STATUS #############");
    for (let roomId in gameRooms) {
        console.log(
            `Game Room ${roomId}: ${gameRooms[roomId].getPop()} Players`
        );
    }
    console.log("#########################");
}
 

// HANDLE NEW SOCKETS
///////////////////////////////////////////////////
io.sockets.on('connection', function (socket) {


    // CONNECTION/DISCONNECT
    ////////////////////////////////

	//log a new connection
	// console.log('NEW USER. ID: ',socket.id);

    //handle disconnects
    socket.once('disconnect', function () {

        //log a disconnect
        // console.log('USER DC. ID: ',socket.id);

        //remove from room if in one
        if ('roomId' in socket) {

            gameRooms[socket.roomId].removeSocket(socket);

            //shut down and delete room if empty
            if (gameRooms[socket.roomId].isEmpty()) {
                gameRooms[socket.roomId].shutdown();
                delete gameRooms[socket.roomId];
            }

            //show current room status
            showRooms(gameRooms);
        }     
    })


    // JOIN ROOM
    ////////////////////////////////

    //connect socket to room
    socket.once ('join_game', function (roomId, name, className) {

        //set name of socket
        socket.name = name.substring(0,6);

        //create new room on request
        if (roomId == 'new_game') {
            //generate new room id
            let newRoomId = generateRoomId(gameRooms);
            
            //create room object
            gameRooms[newRoomId] = new gameRoom(newRoomId);

            //place socket into room
            gameRooms[newRoomId].addSocket(socket, className);

            //show current room status
            showRooms(gameRooms);
        }

        //add to room if room exists and has space
        else if (roomId in gameRooms && gameRooms[roomId].hasSpace()) {

            gameRooms[roomId].addSocket(socket, className);

            //show current room status
            showRooms(gameRooms);
        }

        //reject socket if room full
        else if (roomId in gameRooms) {
            socket.emit('room_full');
        }

        //reject socket if room does not exist
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
//frequency set by game settings in gameSettings.js
}, gameSettings.tickRate);