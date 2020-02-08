//SOCKET.IO
/////////////////////////////

//game state
var state = 'serverMenu';

//socket object
var socket;

//current game code
var gameCode;

//p5 canvas
var canv;

//function to join the game
function join_game(code) {

    state = 'load'

    gameCode = code;

    socket = io();

    socket.emit('join_game', code);

    //reset if no space in room
    socket.once('room_full', function () {
        socket.close();
        state = 'serverMenu';
    });

    //confirm room joining
    socket.once('joined', function (code) {
        gameCode = code;
    });

    // setup game when receive settings
    socket.once('game_settings', function (settings) {
        game = settings;
        resizeCanvas(game.screenWidth,game.screenHeight);

        //set up minimap settings from game.js
        minimapSetup();

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
    canv = createCanvas(game.screenWidth, game.screenHeight);
    canv.parent('canvas-hold');
    strokeWeight(2);
    stroke('black');
    textAlign(CENTER, CENTER);
    textFont(homespunFont);

    //setup input element for menu
    setupCodeInput(canv);
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
                    join_game('new_game');
                    break;
                case 'join':
                    if (getCodeInput() != '') {
                        hideCodeInput();
                        join_game(getCodeInput());
                    }
                    break;
            }
            break;
        case 'nameMenu':
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
                    join_game(getCodeInput());
                }
                return false;
            }
            break;
    }
}