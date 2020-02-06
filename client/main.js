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
    background('#FFF1E8');
    strokeWeight(2);

    //draw all shots
    for (let id in shots) {
        let shot = shots[id];
        fill(game.colorPairs[shot.color][0]);
        stroke(game.colorPairs[shot.color][1]);
        ellipse(shot.x, shot.y, 10, 10);
    }

    //draw all other players
    for (let id in players) {
        if (id != socket.id) {
            let player = players[id];

            //draw player
            fill(game.colorPairs[player.color][0]);
            stroke(game.colorPairs[player.color][1]);
            strokeWeight(2);
            ellipse(player.x, player.y, 50, 50);

            //draw healthbar
            let x_offset = 15
            let y_offset_abs = 35;
            let y_offset = y_offset_abs;
            if (player.y > game.height - 45) {
                y_offset = -35;
            }
            strokeWeight(0);
            fill('black');
            rect(
                player.x-x_offset-1, player.y + y_offset-(y_offset/y_offset_abs), 
                x_offset*2 + 2, 7*(y_offset/y_offset_abs),
            );
            if (player.health > 0) {
                fill(game.colorPairs[player.color][0]);
                rect(
                    player.x - x_offset, player.y + y_offset, 
                    x_offset*2*(player.health/game.health_start), 5*(y_offset/y_offset_abs),
                );
            }
        }
    }
    stroke('black');
    // then draw client player on top
    if (socket.id in players) {
        let player = players[socket.id];
        fill(game.colorPairs[player.color][0]);
        stroke(game.colorPairs[player.color][1]);
        strokeWeight(2);
        ellipse(player.x, player.y, 50, 50);
    }

    // draw crosshair
    strokeWeight(2);
    fill(0,0);
    ellipse(mouseX, mouseY, 30, 30);
    line(mouseX+20, mouseY, mouseX-20, mouseY);
    line(mouseX, mouseY+20, mouseX, mouseY-20);

    // draw user healthbar
    if (socket.id in players) {
        let player = players[socket.id];
        strokeWeight(0);
        fill('black');
        rect(
            game.width/4-2, game.height - 27,
            game.width/2+4, 24,
        );
        if (player.health > 0) {
            fill(game.colorPairs[player.color][0]);
            rect(
                game.width/4, game.height - 25,
                game.width/2*(player.health/game.health_start), 20
            );
        }
        
    }
}