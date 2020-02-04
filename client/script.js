var socket = io();

//object to hold player info
var players = {};

//recieve player info from server
socket.on ('server_update', function (player_info) {
    players = player_info;
    console.log(players)
})

// Movement keys

//variables to track pressing
var right = false;
var left = false;
var up = false;
var down = false;

//track key downs
document.addEventListener('keydown', function (event) {
    switch (event.keyCode) {
        case 68: // D
            right = true;
            break;
        case 65: // A
            left = true;
            break;
        case 87: // W
            up = true;
            break;
        case 83: // S
            down = true;
            break;
    }
});

//track key ups
document.addEventListener('keyup', function (event) {
    switch (event.keyCode) {
        case 68: // D
            right = false;
            break;
        case 65: // A
            left = false;
            break;
        case 87: // W
            up = false;
            break;
        case 83: // S
            down = false;
            break;
    }
});

//move based on currently pressed keys
setInterval(function () {
    if (right && !left && up && !down) {
        socket.emit('move','rightup');
    }
    else if (!right && left && up && !down) {
        socket.emit('move','leftup');
    }
    else if (right && !left && !up && down) {
        socket.emit('move','rightdown');
    }
    else if (!right && left && !up && down) {
        socket.emit('move','leftdown');
    }
    else if (right && !left) {
        socket.emit('move','right');
    }
    else if (!right && left) {
        socket.emit('move','left');
    }
    else if (up && !down) {
        socket.emit('move','up');
    }
    else if (!up && down) {
        socket.emit('move','down');
    }
}, 20);


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
        ellipse(player.x, player.y, 50,50);
    }
}