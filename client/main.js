var socket = io();

//global game state
var state = 'loading';

//game settings from server
var game = {
    screenWidth: 600,
    screenHeight: 600,
}

//player info from server
var players = {}

//shots info from server
var shots = {}

// p5 setup when settings recieved from server
socket.once('game_settings', function (settings) {
    game = settings;
    resizeCanvas(game.screenWidth,game.screenHeight);

    //Start shoot eventListener from shoot.js
    start_shoot();

    //set up minimap settings from game.js
    minimapSetup();

    //change state
    state = 'game';
});

//recieve player info from server
socket.on ('game_update', function (player_info, shot_info) {
    players = player_info;
    shots = shot_info;
});

var homespunFont;

//p5 preload
function preload () {
    homespunFont = loadFont('client/homespun.ttf');
}

// p5 setup
function setup () {
    createCanvas(game.screenWidth, game.screenHeight).parent('canvas-hold');
    strokeWeight(2);
    stroke('black');

    textAlign(CENTER, CENTER);
    textFont(homespunFont);
}

// p5 drawing
function draw () {
    switch (state) {
        //draw game from game.js
        case "game":
            drawGame();
            break;

        //draw loading screen from menu.js
        case "loading":
            drawLoading();
            break;
    }
}

//returns random integer between low and high, inclusive
function randint(low,high) {
    if (high > low) {
        return Math.floor(Math.random()*(high+1-low) +low);
    }
    return Math.floor(Math.random()*(low+1-high) +high);
}