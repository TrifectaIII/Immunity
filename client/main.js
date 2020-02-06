var socket = io();

//object to hold player info
var players = {};
var shots = {};
var game = {};

//recieve player info from server
socket.on ('server_update', function (player_info, shot_info) {
    players = player_info;
    shots = shot_info;
});

// p5 setup when settings recieved from server
socket.once('game_settings', function (settings) {
    game = settings;
    createCanvas(settings.width,settings.height).parent('canvas-hold');
    background('white');

    strokeWeight(2);
    stroke('black');

    textAlign(CENTER, CENTER);
    textSize(25);

    //Start shoot eventListener from shoot.js
    start_shoot()
});

//does nothing right now
function setup () {
}

//p5 drawing
function draw () {
    clear()
    background('white');
    strokeWeight(2);

    //draw all shots
    for (let id in shots) {
        let shot = shots[id];
        fill(shot.color);
        ellipse(shot.x, shot.y, 10, 10);
    }

    //draw all other players
    for (let id in players) {
        if (id != socket.id) {
            let player = players[id];
            fill(player.color);
            strokeWeight(2);
            ellipse(player.x, player.y, 50, 50);
            fill('white');
            strokeWeight(5);
            text(player.health.toString(), player.x, player.y);
        }
    }

    // then draw client player on top
    if (socket.id in players) {
        let player = players[socket.id];
        fill(player.color);
        strokeWeight(2);
        ellipse(player.x, player.y, 50, 50);
        fill('white')
        strokeWeight(4);
        text(player.health.toString(), player.x, player.y);
    }
    
}