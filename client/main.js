var socket = io();

//game settings from server
var game = {}

//player info from server
var players = {}

//shots info from server
var shots = {}


//recieve player info from server
socket.on ('server_update', function (player_info, shot_info) {
    players = player_info;
    shots = shot_info;
});

// p5 setup when settings recieved from server
socket.once('game_settings', function (settings) {
    game = settings;
    createCanvas(settings.screenWidth,settings.screenHeight).parent('canvas-hold');

    strokeWeight(2);
    stroke('black');

    textAlign(CENTER, CENTER);
    textFont(loadFont('client/homespun.ttf'));

    //Start shoot eventListener from shoot.js
    start_shoot();

    //set up minimap settings from game.js
    minimapSetup();
});

//p5 drawing
function draw () {
    //draw game from game.js
    drawGame();
}

// //currently not using p5 setup function
// function setup () {
// }