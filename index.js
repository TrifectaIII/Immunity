//include gameSettings.js
const gameSettings = require(__dirname + '/gameSettings.js');

//SETUP
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

//Database Library for high scores
const Database = require(__dirname + '/js/Database.js');

//create db if it doesn't exist already
Database.createDB();



// HTTP SERVER
///////////////////////////////////////////////////

//Start Server
serv.listen(process.env.PORT || 8000, () => {
    console.log(`Server Listening on port ${process.env.PORT || 8000}`);
}); // specified port or 8k as backup

//route main page to index.html
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/client/index.html');
});

//Serve client files
app.use('/client',express.static(__dirname + '/client'));

//Serve gameSettings.js file
app.get('/gameSettings.js', (req, res) => {
    res.sendFile(__dirname + '/gameSettings.js');
});

//send list of high scores
app.get('/highscores', (req, res) => {
    Database.getTopScores(gameSettings.highScoreCount, (scores) => {
        res.send(scores);
    });
});

console.log("SERVER BOOTED SUCCESSFULLY");



// GAME ROOMS
///////////////////////////////////////////////////

//include Room constructor from Room.js
const Room = require(__dirname + '/js/Room.js');

//object to hold individual game rooms
var rooms = {};

//generates new, currently-unused roomId
function generateRoomId(rooms) {
    var roomId;
    do{
        roomId = Math.floor(Math.random()*9999)+1;
    }
    while (roomId.toString() in rooms);
    return roomId.toString();
}

//logs current rooms and their populations
function showRooms (rooms) {
    console.log('\n');
    if (Object.keys(rooms).length > 0) {
        console.log("ROOM STATUS ######################");
        for (let roomId in rooms) {
            console.log(
                `Game Room ${roomId}: ${rooms[roomId].playerCount()} Players`
            );
        }
        console.log("##################################");
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

            rooms[socket.roomId].removePlayer(socket);

            //delete room if empty
            if (rooms[socket.roomId].isEmpty()) {

                //properly shut down room
                rooms[socket.roomId].shutDown();

                delete rooms[socket.roomId];
            }

            //show current room status
            showRooms(rooms);
        }     
    });

    //set up ping listener
    socket.on ('pinging', function () {
        socket.emit('ponging');
    });


    // JOIN ROOM
    ////////////////////////////////

    //connect socket to room
    socket.once ('join_game', function (roomId, name) {

        //set name of socket
        let nameTrimmed = name.trim().substring(0, gameSettings.nameMax);

        //reject socket if room does not exist
        if (!(roomId in rooms) && roomId != 'new_game') {
            socket.emit('rejection', 'Game Does Not Exist');
        }

        //reject socket if room full
        else if (roomId in rooms && rooms[roomId].isFull()) {
            socket.emit('rejection', 'Game Full');
        }

        //create new room on request
        else if (roomId == 'new_game') {
            //generate new room id
            let newRoomId = generateRoomId(rooms);
            
            //create room object
            rooms[newRoomId] = new Room(newRoomId, io);

            //place socket into room
            rooms[newRoomId].addPlayer(socket, nameTrimmed);

            //show current room status
            showRooms(rooms);
        }

        //add to room if room exists and has space
        else if (roomId in rooms) {

            rooms[roomId].addPlayer(socket, nameTrimmed);

            //show current room status
            showRooms(rooms);
        }

        //reject if any other situation
        else {
            socket.emit('rejection', 'Reason Unknown');
        }
    });
});