var socket = io();

//object to hold player info
var players = {};
var shots = {};

//recieve player info from server
socket.on ('server_update', function (player_info, shot_info) {
    players = player_info;
    shots = shot_info;
})

// p5 setup
function setup () {
    createCanvas(750,750).parent('canvas-hold');
    strokeWeight(2);
    stroke('black');
    textAlign(CENTER, CENTER);
    background('white');
    textSize(25);
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

    //draw all players
    for (let id in players) {
        let player = players[id];
        fill(player.color);
        strokeWeight(2);
        ellipse(player.x, player.y, 50, 50);
        fill('white')
        strokeWeight(5);
        text(player.health.toString(), player.x, player.y)
    }
}