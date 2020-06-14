//SOCKET.IO
/////////////////////////////

// global game state
var state = 'menu';

// current roomId
var roomId;

// socket object
var socket;

//function to close game and return to menus
function endGame() {
    Ping.stop();
    Controls.stop();
    restartMenus();
    socket.close();
}

// function to join the game
function joinGame(menuChoices) {

    //switch state
    state = 'load';

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
        Errors.displayError('Server Connection Error', 5000);
        endGame();
    });
    socket.once('connect_timeout', function (timeout) {
        console.log('connect_timeout', timeout);
        Errors.displayError('Server Connection Timeout', 5000);
        endGame();
    });
    socket.on('error', function (error) {
        console.log('error', error);
        Errors.displayError('Socket Error', 5000);
    });

    //return to server menu if disconnected
    socket.once('disconnect', function (reason) {
        console.log('disconnect', reason);
        if(!Errors.active) {
            Errors.displayError('Server Disconnected', 5000);
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
        Errors.displayError(`REJECTED: ${reason}`, 5000);
        endGame();
    });

    //confirm room joining
    socket.once('joined', function (newId) {

        //set global roomId
        roomId = newId;

        //Start controls (controls.js)
        Controls.start(socket);

        //remove error message if shown
        Errors.hideError();

        //change state
        state = 'game';

        //recieve player info from server
        socket.on ('game_update', function (serverData) {
            //save to objects (game.js)
            gameData = serverData.roomData;
            playingData = serverData.playerData.playing;
            waitingData = serverData.playerData.waiting;
            shotData = serverData.shotData.playershots;
            enemyShotData = serverData.shotData.enemyshots;
            pickupData = serverData.pickupData;
            enemyData = serverData.enemyData;
            zoneData = serverData.zoneData;
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

    //draw based on current state
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
            //draw death menu when dead
            if (socket.id in waitingData) {
                drawDeathMenus();
            }
            break;
    }

    //no matter state, draw error if active (error.js)
    Errors.drawError();
}

//look for button clicks during menus
function mouseClicked () {

    switch (state) {

        case 'menu':
            menuMouseClicked(); //(menu.js)
            break;

        case 'game':
            //listen for clicks when player is dead
            if (socket.id in waitingData) {
                deathMenuMouseClicked(socket);
            }
    }

}

//look for enter presses on menus
function keyPressed () {

    switch (state) {

        case 'menu':
            menuKeyPressed(keyCode); //(menu.js)
            break;
    }
}