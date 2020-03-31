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
    state = 'load';

    //connect socket to server
    socket = io({
        //no reconnection allowed
        reconnection:false,
    });

    //capture socket errors
    socket.once('connect_error', function (error) {
        console.log('connect_error', error);
        errors.displayError('Server Connection Error', 5000);
        restartMenus();
        socket.close();
    });
    socket.once('connect_timeout', function (timeout) {
        console.log('connect_timeout', timeout);
        errors.displayError('Server Connection Timeout', 5000);
        restartMenus();
        socket.close();
    });
    socket.on('error', function (error) {
        console.log('error', error);
        errors.displayError('Socket Error', 5000);
    });

    //return to server menu if disconnected
    socket.once('disconnect', function (reason) {
        console.log('disconnect', reason);
        if(!errors.active) {
            errors.displayError('Server Disconnected', 5000);
        }
        restartMenus();
        socket.close();
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
        errors.displayError(`REJECTED: ${reason}`, 5000);
        restartMenus();
        socket.close();
    });

    //confirm room joining
    socket.once('joined', function (newId) {

        //set global roomId
        roomId = newId;

        //Start controls (controls.js)
        startControls(socket);

        //remove error message if shown
        errors.hideError();

        //ask player to choose a class
        inGameMenuState = 'dead';
        state = 'ingamemenu';

        //ask player again whenever server requests
        socket.on('player_died', function () {
            inGameMenuState = 'dead';
            state = 'ingamemenu';
        });

        socket.on('player_spawned', function () {
            state = 'game';
        });

        //recieve player info from server
        socket.on ('game_update', function (serverData) {
            //save to objects (game.js)
            gameData = serverData.game_info;
            playerData = serverData.player_info;
            shotData = serverData.shot_info;
            pickupData = serverData.pickup_info;
            enemyData = serverData.enemy_info;
            tree = serverData.tree_info;
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
            break;

        //draw in game menus over game (ingamemenu.js)
        case 'ingamemenu':
            drawGame();
            drawInGameMenus();
            break;
    }

    //no matter state, draw error if active (error.js)
    errors.drawError();
}

//look for button clicks during menus
function mouseClicked () {

    switch (state) {

        case 'menu':
            menuMouseClicked(); //(menu.js)
            break;

        case 'ingamemenu':
            inGameMenuMouseClicked(socket);//(ingamemenu.js)
            break;
    }

}

//look for enter presses on menus
function keyPressed () {
    switch (state) {

        case 'menu':
            menuKeyPressed(keyCode); //(menu.js)
            break;

        // case 'ingamemenu':
        //     break;
    }
}