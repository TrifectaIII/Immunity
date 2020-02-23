// NODE SETUP
///////////////////////////////////////////////////

// load express package
const express = require('express'); 

//create express app
const app = express(); 

//compress files
app.use(require('compression')());

// minify files (dont use minification during testing)
// app.use(require('express-minify')());

//serve http over app
const serv = require('http').Server(app);

// connect socket.io to server
const io = require('socket.io')(serv);



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

console.log("SERVER BOOTED SUCCESSFULLY");

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
    console.log('\n');
    if (Object.keys(gameRooms).length > 0) {
        console.log("ROOM STATUS #############");
        for (let roomId in gameRooms) {
            console.log(
                `Game Room ${roomId}: ${gameRooms[roomId].playerCount()} Players`
            );
        }
        console.log("#########################");
    }
    else {
        console.log("ROOM STATUS: No Rooms Active");
    }
    console.log('\n');
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

            gameRooms[socket.roomId].removePlayer(socket);

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
        socket.name = name.trim().substring(0,6);

        //reject socket if chosen class is non-existent
        if (!(className in gameSettings.classes)) {
            socket.emit('rejection', 'Invalid Class');
        }

        //reject socket if room full
        else if (roomId in gameRooms && gameRooms[roomId].isFull()) {
            socket.emit('rejection', 'Game Full');
        }

        //reject socket if room does not exist
        else if (!(roomId in gameRooms) && roomId != 'new_game') {
            socket.emit('rejection', 'Game Does Not Exist');
        }

        //create new room on request
        else if (roomId == 'new_game') {
            //generate new room id
            let newRoomId = generateRoomId(gameRooms);
            
            //create room object
            gameRooms[newRoomId] = new gameRoom(newRoomId);

            //place socket into room
            gameRooms[newRoomId].addPlayer(socket, className);

            //show current room status
            showRooms(gameRooms);
        }

        //add to room if room exists and has space
        else if (roomId in gameRooms) {

            gameRooms[roomId].addPlayer(socket, className);

            //show current room status
            showRooms(gameRooms);
        }

        //reject if any other situation
        else {
            socket.emit('rejection', 'Reason Unknown');
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