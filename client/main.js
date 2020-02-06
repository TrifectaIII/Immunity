var socket = io();

//object to hold draw info
var players = {}
var shots = {}
var game = {}
var screen_offset = {
    x:0,
    y:0,
}
var deathTimer = 0;
var deathCount;

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
    start_shoot()
});

//does nothing right now
function setup () {
}

//p5 drawing
function draw () {
    if (socket.id in players) {
        let player = players[socket.id];

        //send movement data
        sendMove();

        //refresh screen
        clear()
        background('#FFF1E8');

        //calculate screen offset
        screen_offset.x = Math.min(Math.max(0, player.x - game.screenWidth/2), game.width-game.screenWidth);
        screen_offset.y = Math.min(Math.max(0, player.y - game.screenHeight/2), game.height-game.screenHeight);

        //draw grid
        strokeWeight(1);
        stroke('#C2C3C7');
        for (let x = 100; x < game.width; x+=100) {
            if (x-screen_offset.x > 0 &&
                x-screen_offset.x < game.screenWidth) {
                    line(x-screen_offset.x, 0,
                         x-screen_offset.x, game.screenWidth);
            }
        }
        for (let y = 100; y < game.height; y+=100) {
            if (y-screen_offset.y > 0 &&
                y-screen_offset.y < game.screenHeight) {
                    line(0, y-screen_offset.y,
                         game.screenHeight, y-screen_offset.y);
            }
        }

        //draw all shots
        strokeWeight(2);
        for (let id in shots) {
            let shot = shots[id];
            if (shot.x-screen_offset.x > 0 &&
                shot.x-screen_offset.x < game.screenWidth &&
                shot.y-screen_offset.y > 0 &&
                shot.y-screen_offset.y < game.screenHeight) {
                    fill(game.colorPairs[shot.color][0]);
                    stroke(game.colorPairs[shot.color][1]);
                    ellipse(shot.x-screen_offset.x, shot.y-screen_offset.y, 10, 10);
            }
        }

        //draw all other players
        for (let id in players) {
            if (id != socket.id) {
                let player = players[id];

                if (player.x-screen_offset.x > -50 &&
                    player.x-screen_offset.x < game.screenWidth + 50 &&
                    player.y-screen_offset.y > -50 &&
                    player.y-screen_offset.y < game.screenHeight + 50) {

                        //draw player
                        fill(game.colorPairs[player.color][0]);
                        stroke(game.colorPairs[player.color][1]);
                        strokeWeight(2);
                        ellipse(player.x-screen_offset.x, player.y-screen_offset.y, 50, 50);

                        //draw healthbar
                        if (player.health > 0) {
                            let x_offset = 15
                            let y_offset_abs = 35;
                            let y_offset = y_offset_abs;
                            if (player.y-screen_offset.y > game.screenHeight - 50) {
                                y_offset = -35;
                            }
                            strokeWeight(0);
                            fill('black');
                            rect(
                                player.x-x_offset-1-screen_offset.x, player.y + y_offset-(y_offset/y_offset_abs)-screen_offset.y, 
                                x_offset*2 + 2, 7*(y_offset/y_offset_abs),
                            );
                            fill(game.colorPairs[player.color][0]);
                            rect(
                                player.x - x_offset-screen_offset.x, player.y + y_offset-screen_offset.y, 
                                x_offset*2*(player.health/game.health_start), 5*(y_offset/y_offset_abs),
                            );
                        }
                        //draw death cross
                        else {
                            strokeWeight(5);
                            stroke('#FF004D');
                            line(player.x-screen_offset.x+25,
                                 player.y-screen_offset.y+25,
                                 player.x-screen_offset.x-25,
                                 player.y-screen_offset.y-25);
                            line(player.x-screen_offset.x+25,
                                 player.y-screen_offset.y-25,
                                 player.x-screen_offset.x-25,
                                 player.y-screen_offset.y+25);
                        }
                }
            }
        }
        // then draw client player on top
        fill(game.colorPairs[player.color][0]);
        stroke(game.colorPairs[player.color][1]);
        strokeWeight(2);
        ellipse(player.x-screen_offset.x, player.y-screen_offset.y, 50, 50);
        //draw death cross and death message
        if (player.health <= 0) {
            strokeWeight(5);
            stroke('#FF004D');
            line(player.x-screen_offset.x+25,
                    player.y-screen_offset.y+25,
                    player.x-screen_offset.x-25,
                    player.y-screen_offset.y-25);
            line(player.x-screen_offset.x+25,
                    player.y-screen_offset.y-25,
                    player.x-screen_offset.x-25,
                    player.y-screen_offset.y+25);
            
            background(0, 200);
            textSize(40);
            stroke('black');
            text("YOU ARE DEAD", game.screenWidth/2, game.screenHeight/2);
        }

        // draw crosshair
        strokeWeight(2);
        fill(0,0);
        ellipse(mouseX, mouseY, 30, 30);
        line(mouseX+20, mouseY, mouseX-20, mouseY);
        line(mouseX, mouseY+20, mouseX, mouseY-20);

        // draw user healthbar
        strokeWeight(0);
        fill('black');
        rect(
            game.screenWidth/4-2, game.screenHeight - 27,
            game.screenWidth/2+4, 24,
        );
        fill(game.colorPairs[player.color][0]);
        if (player.health > 0) {
            rect(
                game.screenWidth/4, game.screenHeight - 25,
                game.screenWidth/2*(player.health/game.health_start), 20
            );
            stroke('black');
            strokeWeight(4);
            textSize(20);
            text(player.health.toString()+' / '+game.health_start.toString() ,game.screenWidth/2,game.screenHeight-17);
            if (deathTimer > 0) {
                deathTimer = 0;
                clearInterval(deathCount);
            }
        }
        else {
            let deathProg = Math.min(deathTimer/game.respawnTime, 1)
            rect(
                game.screenWidth/4, game.screenHeight - 25,
                game.screenWidth/2*(deathProg), 20
            );
            if (deathTimer == 0) {
                deathTimer += 50;
                deathCount = setInterval(function () {
                    deathTimer += 50;
                }, 50);
            }
        }
    }
}