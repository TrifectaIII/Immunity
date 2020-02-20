//SOCKET.IO
/////////////////////////////

// global game state
var state = 'menu';

// current roomId
var roomId;

// socket object
var socket;

// function to join the game
function joinGame(menuChoices) {

    //switch state
    state = 'load'

    //connect socket to server
    socket = io({
        //no reconnection allowed
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
    socket.emit(
        'join_game', 
        menuChoices.roomId, 
        menuChoices.name, 
        menuChoices.className
    );

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

        //set global roomId
        roomId = newId;

        //Start controls (controls.js)
        startControls(canvas);

        //change state
        state = 'game';

        //remove error message if shown
        errors.hideError();

        //recieve player info from server
        socket.on ('game_update', function (serverData) {
            //save to objects (game.js)
            playerData = serverData.player_info;
            shotData = serverData.shot_info;
            pickupData = serverData.pickup_info;
        });
    });
}

//p5.js
/////////////////////////////

//p5 canvas
var canvas;

//font loaded from ttf file
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

        //draw loading screen (menu.js)
        case 'load':
            drawLoading();
            break;

        //draw menus (menu.js)
        case 'menu':
            drawMenus(canvas);
            break;
        
        //draw game (game.js)
        case 'game':
            drawGame();
            break;
    }

    //no matter state, draw error if active (error.js)
    errors.drawError();
}

//look for button clicks during menus
function mouseClicked () {
    if (state == 'menu') {
        menuMouseClicked(); //(menu.js)
    }
}

//look for enter presses on menu
function keyPressed () {
    if (state == 'menu') {
        menuKeyPressed(keyCode); //(menu.js)
    }
}