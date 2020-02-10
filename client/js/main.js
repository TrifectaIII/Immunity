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

    socket = io();

    socket.emit('join_game', roomId, name);

    //reset if no space in room
    socket.once('room_full', function () {
        socket.close();
        state = 'serverMenu';
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

        //recieve player info from server
        socket.on ('game_update', function (game_info) {
            //save to objects in game.js
            players = game_info.player_info;
            shots = game_info.shot_info;

            //change state
            if (state != 'game') {
                state = 'game';
            }
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