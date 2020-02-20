//SOCKET.IO
/////////////////////////////

//game state
var state = 'menu';

//socket object
var socket;

//p5 canvas
var canvas;

//function to join the game
function joinGame() {

    //switch state
    state = 'load'

    //connect socket to server w/ no reconnection allowed
    socket = io({
        reconnection:false,
    });

    //capture socket errors
    socket.on('connect_error', function (error) {
        console.log('connect_error', error);
        errors.displayError('Server Connection Error',5000);
        state = 'serverMenu';
        socket.close();
    })
    socket.on('connect_timeout', function (timeout) {
        console.log('connect_timeout', timeout);
        errors.displayError('Server Connection Timeout',5000);
        state = 'serverMenu';
        socket.close();
    })
    socket.on('error', function (error) {
        console.log('error', error);
        errors.displayError('Socket Error',5000);
    })

    //return to server menu if disconnected
    socket.on('disconnect', function (reason) {
        console.log('disconnect', reason);
        if(!errors.active) {
            errors.displayError('Server Disconnected',5000);
        }
        restartMenus();
        socket.close();
    })

    //attempt to join game
    socket.emit('join_game', roomId, name, className);

    //return to server menu if no space in room and display error
    socket.once('room_full', function () {
        errors.displayError('Game Full', 5000);
        restartMenus();
        socket.close();
    });

    //return to server menu if no room with that id exists and display error
    socket.once('no_such_room', function () {
        errors.displayError('Game Does Not Exist', 5000);
        restartMenus();
        socket.close();
    });

    //confirm room joining
    socket.once('joined', function (newId) {

        //set new id if different
        roomId = newId;

        //Start controls from controls.js
        startControls(canvas);

        //change state
        state = 'game';

        //remove error message if shown
        errors.hideError();

        //recieve player info from server
        socket.on ('game_update', function (game_info) {
            //save to objects in game.js
            players = game_info.player_info;
            shots = game_info.shot_info;
            pickups = game_info.pickup_info;
        });
    });
}

//p5.js
/////////////////////////////

var homespunFont;

//p5 preload
function preload () {
    homespunFont = loadFont('client/homespun.ttf');
}

// p5 setup
function setup () {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-hold');

    textFont(homespunFont);
    textAlign(CENTER,CENTER);
}

//resize canvasas to always match window size
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// p5 drawing
function draw () {

    switch (state) {

        //draw loading screen from menu.js
        case 'load':
            drawLoading();
            break;

        //draw menus from menu.js
        case 'menu':
            drawMenus(canvas);
            break;
        
        //draw game from game.js
        case 'game':
            drawGame();
            break;
    }

    //no matter state, draw error if active
    errors.drawError();
}

//look for button clicks during menus
function mouseClicked () {
    if (state == 'menu') {
        menuMouseClicked();
    }
}

//look for enter presses on menu
function keyPressed () {
    if (state == 'menu') {
        menuKeyPressed(keyCode);
    }
}