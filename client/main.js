//game state
var state = 'menu';

//connect to socket
var socket = io();

// p5 setup when settings recieved from server
socket.once('game_settings', function (settings) {
    game = settings;
    resizeCanvas(game.screenWidth,game.screenHeight);

    //set up minimap settings from game.js
    minimapSetup();

    //Start shoot eventListener from shoot.js
    start_shoot();
});

//recieve player info from server
socket.on ('game_update', function (player_info, shot_info) {
    //save to objects in game.js
    players = player_info;
    shots = shot_info;

    //change state
    state = 'game';
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

        //draw menu from menu.js
        case "menu":
            drawServerMenu();
            break;
    }
}

function mouseClicked () {
    switch (state) {
        case "menu":
            switch (clickServerMenu()) {
                case "new game":
                    console.log('new game')
                    break;
                case "join":
                    console.log('join')
                    break;
            }
            break;
    }
}