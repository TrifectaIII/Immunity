//SOCKET.IO
/////////////////////////////

//enum for game states
var States = Object.freeze({
    MENU: 'MENU',
    LOAD: 'LOAD',
    GAME: 'GAME',
});

// global game state starts at menu
var state = States.MENU;

//info on game state from server (starts empty)
var gameState = {
    roomInfo:{},
    players:{
        playing:{},
        waiting:{},
    },
    enemies:{},
    bosses:{},
    shots:{
        playerShots:{},
        enemyShots:{},
        bossShots:{},
    },
    zones:{},
    pickups:{},
    abilities:{},
};

// current roomId
var roomId;

// socket object
var socket;

//function to close game and return to menus
function endGame() {
    Ping.stop();
    Control.stop();
    Menu.restartMenus();
    socket.close();
    state = States.MENU;
}

// function to join the game
function joinGame(menuChoices) {

    //switch state
    state = States.LOAD;

    //connect socket to server
    socket = io({
        //no reconnection allowed
        reconnection:false,
    });

    //start pinging
    Ping.start(socket);

    //capture socket errors
    socket.once('connect_error', function (error) {
        console.log('connect_error', error);
        Error.displayError('Server Connection Error', 5000);
        endGame();
    });
    socket.once('connect_timeout', function (timeout) {
        console.log('connect_timeout', timeout);
        Error.displayError('Server Connection Timeout', 5000);
        endGame();
    });
    socket.on('error', function (error) {
        console.log('error', error);
        Error.displayError('Socket Error', 5000);
    });

    //return to server menu if disconnected
    socket.once('disconnect', function (reason) {
        console.log('disconnect', reason);
        if(!Error.active) {
            Error.displayError('Server Disconnected', 5000);
        }
        endGame();
    })

    //attempt to join game
    socket.emit(
        'join_game', 
        menuChoices.roomId, 
        menuChoices.name
    );

    //if socket rejected, send back to menu and display reason error
    socket.once('rejection', function (reason) {
        console.log('rejection', reason);
        Error.displayError(`REJECTED: ${reason}`, 5000);
        endGame();
    });

    //confirm room joining
    socket.once('joined', function (newId) {

        //set global roomId
        roomId = newId;

        //Start controls (controls.js)
        Control.start(socket);

        //remove error message if shown
        Error.hideError();

        //change state
        state = States.GAME;

        //recieve player info from server
        socket.on ('game_update', function (serverState) {
            //save to local object
            gameState = serverState;
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
    //create canvas at size of window
    canvas = createCanvas(windowWidth, windowHeight);

    //place into div
    canvas.parent('canvas-hold');

    //set up font defaults
    textFont(homespunFont);
    textAlign(CENTER,CENTER);
}

//resize canvasas to always match window size
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// p5 drawing
function draw () {

    clear();

    //draw based on current state
    switch (state) {

        //draw loading screen (menu.js)
        case States.LOAD:
            Menu.drawLoading();
            break;

        //draw menus (menu.js)
        case States.MENU:
            Menu.drawMenus(canvas);
            break;
        
        //draw game (game.js)
        case States.GAME:
            Render.drawGame(socket, gameState);
            UI.drawUI(socket, gameState);
            break;
    }

    //no matter state, draw error if active (error.js)
    Error.drawError();
}

//look for button clicks during menus
function mouseClicked () {

    switch (state) {

        case States.MENU:
            Menu.menuMouseClicked(); //(menu.js)
            break;

        case States.GAME:
            //listen for clicks when player is dead
            if (socket.id in gameState.players.waiting) {
                UI.deathMenuMouseClicked(socket, gameState);
            }
    }

}

//look for enter presses on menus
function keyPressed () {

    switch (state) {

        case States.MENU:
            Menu.menuKeyPressed(keyCode); //(menu.js)
            break;
    }
}