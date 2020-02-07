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

//mini map settings
var minimap = {};

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

    //set up minimap settings
    minimap.width = game.screenWidth/7;
    minimap.height = game.screenHeight/7;
    minimap.overflow = 3;
    minimap.offset = {
        x:3,
        y:game.screenHeight - minimap.height - 3,
    }
    minimap.pip_size = 5;
});

//does nothing right now
function setup () {
}

//p5 drawing
function draw () {
    if (socket.id in players) {
        let player = players[socket.id];

        //send movement data only if alive
        if (player.health > 0) {
            sendMove();
        }

        //refresh screen
        clear()
        background('#FFF1E8');

        //calculate screen offset based on player position
        calcOffset(player);

        //draw grid
        drawGrid();

        //draw dead players
        drawDead();

        //draw client player if dead
        if (player.health <= 0) {
            drawPlayer(player);
        }

        //draw all shots
        drawShots();

        //draw living players
        drawLiving();

        // then draw client player on top if living
        if (player.health > 0) {
            drawPlayer(player);
        }

        //draw minimap
        drawMinimap();

        //draw death message if client player is dead
        deathMsg(player);

        // draw crosshair
        drawCrosshair(player);

        //draw UI
        if (player.health > 0) {
            //draw healthbar, then reset respawn timer if not already reset
            drawHealthbar(player);
            if (deathTimer > 0) {
                deathTimer = 0;
                clearInterval(deathCount);
            }
        } else {
            //draw respawnbar, then start respawn tiemr if not started
            drawRespawnTimer(player);
            if (deathTimer == 0) {
                deathTimer += 50;
                deathCount = setInterval(function () {
                    deathTimer += 50;
                }, 50);
            }
        }
    }
}

//calculate screen offset based on player position
function calcOffset (player) {
    screen_offset.x = Math.min(Math.max(0, player.x - game.screenWidth/2), game.width-game.screenWidth);
    screen_offset.y = Math.min(Math.max(0, player.y - game.screenHeight/2), game.height-game.screenHeight);
}

//draw grid to visually indicate movement around world
function drawGrid () {
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
}

//draw all shots
function drawShots() {
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
}

//draw dead players 
function drawDead () {
    for (let id in players) {
        if (id != socket.id) {
            let player = players[id];
            if (player.health <= 0 &&
                player.x-screen_offset.x > -50 &&
                player.x-screen_offset.x < game.screenWidth + 50 &&
                player.y-screen_offset.y > -50 &&
                player.y-screen_offset.y < game.screenHeight + 50) {
                    //draw player as transparent
                    let fillcolor = color(game.colorPairs[player.color][0]);
                    fillcolor.setAlpha(100);
                    let strokecolor = color(game.colorPairs[player.color][1]);
                    strokecolor.setAlpha(100)
                    fill(fillcolor);
                    stroke(strokecolor);
                    strokeWeight(2);
                    ellipse(player.x-screen_offset.x, player.y-screen_offset.y, 50, 50);

                    //draw death cross
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

//draw living players
function drawLiving () {
    for (let id in players) {
        if (id != socket.id) {
            let player = players[id];
            if (player.health > 0 &&
                player.x-screen_offset.x > -50 &&
                player.x-screen_offset.x < game.screenWidth + 50 &&
                player.y-screen_offset.y > -50 &&
                player.y-screen_offset.y < game.screenHeight + 50) {
                    //draw player
                    fill(game.colorPairs[player.color][0]);
                    stroke(game.colorPairs[player.color][1]);
                    strokeWeight(2);
                    ellipse(player.x-screen_offset.x, player.y-screen_offset.y, 50, 50);

                    //draw healthbar
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
        }
    }
}

//draw client's player
function drawPlayer (player) {
    fill(game.colorPairs[player.color][0]);
    stroke(game.colorPairs[player.color][1]);
    strokeWeight(2);
    ellipse(player.x-screen_offset.x, player.y-screen_offset.y, 50, 50);
    //draw death cross if dead
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
    }
}

//tint screen and display message when player is dead
function deathMsg (player) {
    if (player.health <= 0) {
        background(0, 200);
        fill(game.colorPairs[player.color][0]);
        stroke('black');
        strokeWeight(3);
        textSize(40);
        text("YOU ARE DEAD", game.screenWidth/2, game.screenHeight/2);
    }
}

//draw cosshair
function drawCrosshair (player) {
    stroke(game.colorPairs[player.color][1]);
    strokeWeight(2);
    fill(0,0);
    ellipse(mouseX, mouseY, 30, 30);
    line(mouseX+20, mouseY, mouseX-20, mouseY);
    line(mouseX, mouseY+20, mouseX, mouseY-20);
}

//draws the main bar at bottom of the screen
function drawMainbar (player, prog) {
    //prog is ratio from 0 to 1
    prog = Math.min(1,Math.max(0,prog));
    strokeWeight(0);
    fill('black');
    rect(
        game.screenWidth/4-2, game.screenHeight - 27,
        game.screenWidth/2+4, 24,
    );
    fill(game.colorPairs[player.color][0]);
    rect(
        game.screenWidth/4, game.screenHeight - 25,
        game.screenWidth/2*(prog), 20
    );
}

//draw client players healthbar
function drawHealthbar (player) {
    drawMainbar(player, player.health/game.health_start);
    stroke('black');
    strokeWeight(4);
    textSize(20);
    fill('#FFF1E8');
    text(player.health.toString()+' / '+game.health_start.toString() ,game.screenWidth/2,game.screenHeight-17);
}

//draw client players respawn timer bar
function drawRespawnTimer (player) {
    drawMainbar(player, deathTimer/game.respawnTime);
}

function drawMinimap () {
    //draw minimap background
    strokeWeight(0);
    fill(0, 150);
    rect(
        minimap.offset.x - minimap.overflow,
        minimap.offset.y - minimap.overflow, 
        minimap.width + minimap.overflow*2, 
        minimap.height + minimap.overflow*2
    );

    //draw other players
    for (let id in players) {
        if (id != socket.id && players[id].health > 0) {
            let player = players[id];
            fill(game.colorPairs[player.color][0]);
            ellipse(
                (player.x/game.width)*minimap.width + minimap.offset.x,
                (player.y/game.height)*minimap.height + minimap.offset.y,
                minimap.pip_size, minimap.pip_size,
            );
        }
    }

    //draw player with outline indicator
    let player = players[socket.id];
    strokeWeight(1);
    stroke('#FFF1E8');
    fill(game.colorPairs[player.color][0]);
    ellipse(
        (player.x/game.width)*minimap.width + minimap.offset.x,
        (player.y/game.height)*minimap.height + minimap.offset.y,
        minimap.pip_size*1.25, minimap.pip_size*1.25,
    );

}