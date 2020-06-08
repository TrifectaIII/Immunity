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
app.get('/js/gameSettings.js', function (req, res) {
    res.sendFile(__dirname + '/js/gameSettings.js');
});

console.log("SERVER BOOTED SUCCESSFULLY");



// GAME ROOMS
///////////////////////////////////////////////////

//include gameSettings.js
const gameSettings = require(__dirname + '/js/gameSettings.js');

//include Room constructor from Room.js
const Room = require(__dirname + '/js/Room.js');

//object to hold individual game rooms
var Rooms = {};

//generates new, currently-unused roomId
function generateRoomId(Rooms) {
    let roomIdCounter = 101;
    while (roomIdCounter.toString() in Rooms) {
        roomIdCounter += 1;
    }
    return roomIdCounter.toString();
}

//logs current rooms and their populations
function showRooms (Rooms) {
    console.log('\n');
    if (Object.keys(Rooms).length > 0) {
        console.log("ROOM STATUS #############");
        for (let roomId in Rooms) {
            console.log(
                `Game Room ${roomId}: ${Rooms[roomId].playerCount()} Players`
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


    //handle disconnects
    socket.once('disconnect', function () {

        //remove from room if in one
        if ('roomId' in socket) {

            Rooms[socket.roomId].removePlayer(socket);

            //delete room if empty
            if (Rooms[socket.roomId].isEmpty()) {
                delete Rooms[socket.roomId];
            }

            //show current room status
            showRooms(Rooms);
        }     
    });

    //set up ping listener
    socket.on ('ping2', function () {
        socket.emit('pong2');
    });


    // JOIN ROOM
    ////////////////////////////////

    //connect socket to room
    socket.once ('join_game', function (roomId, name) {

        //set name of socket
        socket.name = name.trim().substring(0, gameSettings.nameMax);

        //reject socket if room does not exist
        if (!(roomId in Rooms) && roomId != 'new_game') {
            socket.emit('rejection', 'Game Does Not Exist');
        }

        //reject socket if room full
        else if (roomId in Rooms && Rooms[roomId].isFull()) {
            socket.emit('rejection', 'Game Full');
        }

        //create new room on request
        else if (roomId == 'new_game') {
            //generate new room id
            let newRoomId = generateRoomId(Rooms);
            
            //create room object
            Rooms[newRoomId] = new Room(newRoomId);

            //place socket into room
            Rooms[newRoomId].addPlayer(socket);

            //show current room status
            showRooms(Rooms);
        }

        //add to room if room exists and has space
        else if (roomId in Rooms) {

            Rooms[roomId].addPlayer(socket);

            //show current room status
            showRooms(Rooms);
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
    for (let roomId in Rooms) {
        let serverData = Rooms[roomId].update();
        io.to(roomId).emit('game_update', serverData);
    }
//frequency set by game settings in gameSettings.js
}, gameSettings.tickRate);