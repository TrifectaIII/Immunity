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
    createCanvas(600,300).parent('canvas-hold');
}

//p5 drawing
function draw () {
    clear()
    for (let id in players) {
        let player = players[id];
        fill(player.color);
        ellipse(player.x, player.y, 50, 50);
    }

    for (let id in shots) {
        let shot = shots[id];
        fill(shot.color);
        ellipse(shot.x, shot.y, 10, 10);
    }
}