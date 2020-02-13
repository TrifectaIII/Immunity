//SOCKET.IO
/////////////////////////////

//game state
var state = 'nameMenu';

//socket object
var socket;

//current game code
var roomId;

//p5 canvas
var canv;

//players name
var name;

//game settings from server
var game;

//function to join the game
function join_game() {

    state = 'load'

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

    //return to server menu if disconnected and display error
    socket.on('disconnect', function (reason) {
        console.log('disconnect', reason);
        console.log(reason)
        errors.displayError('Server Disconnected',5000);
        state = 'serverMenu';
        socket.close();
    })

    socket.emit('join_game', roomId, name);

    //return to server menu if no space in room and display error
    socket.once('room_full', function () {
        errors.displayError('Game Full',5000);
        state = 'serverMenu';
        socket.close();
    });

    //confirm room joining
    socket.once('joined', function (newId) {
        roomId = newId;
    });

    // setup game when receive settings
    socket.once('game_settings', function (settings) {

        //update settings object
        game = settings;

        //Start shoot eventListener from shoot.js
        start_shoot(canv.elt);

        //change state
        state = 'game';

        //remove error message if shown
        errors.hideError();

        //recieve player info from server
        socket.on ('game_update', function (game_info) {
            //save to objects in game.js
            players = game_info.player_info;
            shots = game_info.shot_info;
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
    canv = createCanvas(windowWidth, windowHeight);
    canv.parent('canvas-hold');

    textFont(homespunFont);
    textAlign(CENTER,CENTER);

    //setup input for server menu
    setupCodeInput(canv);

    //setup input for name menu
    setupNameInput(canv);

}

//resize canvas to always match window size
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// p5 drawing
function draw () {
    switch (state) {
        //draw game from game.js
        case 'game':
            drawGame();
            break;

        //draw loading screen from menu.js
        case 'load':
            drawLoading();
            break;

        //draw server menu from menu.js
        case 'serverMenu':
            drawServerMenu();
            break;

        //draw name menu from menu.js
        case 'nameMenu':
            drawNameMenu();
            break;
    }

    //no matter state, draw error if active
    errors.drawError();
}

//look for button clicks during menus
function mouseClicked () {
    switch (state) {
        case 'serverMenu':
            switch (clickServerMenu()) {
                case 'new game':
                    hideCodeInput();
                    roomId = 'new_game'
                    join_game();
                    break;
                case 'join':
                    if (getCodeInput() != '') {
                        hideCodeInput();
                        roomId = getCodeInput();
                        join_game();
                    }
                    break;
            }
            break;
        case 'nameMenu':
            if (clickNameMenu() && getNameInput() != '') {
                name = getNameInput();
                hideNameInput();
                state = 'serverMenu';
            }
            break;
    }
}

//look for enter presses on menu
function keyPressed () {
    switch (state) {
        case 'serverMenu':
            if (keyCode == ENTER) {
                if (getCodeInput() != '') {
                    hideCodeInput();
                    roomId = getCodeInput();
                    join_game();
                }
                return false;
            }
            break;
        case 'nameMenu':
            if (keyCode == ENTER) {
                if (getNameInput() != '') {
                    name = getNameInput();
                    hideNameInput();
                    state = 'serverMenu';
                }
                return false;
            }
            break;
    }
}