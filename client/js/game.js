//player info from server
var players = {}

//shots info from server
var shots = {}

//object to hold info re: screen offset based on player position
var screen_offset = {
    x:0,
    y:0,
}

// hold time of death
var deathStart;

//minimap settings
var minimap = {};

//set up minimap settings based on game and screen size
function minimapSetup () {
    minimap.width = game.screenWidth/7;
    minimap.height = game.screenHeight/7;
    minimap.overflow = 3;
    minimap.offset = {
        x:minimap.overflow + 3,
        y:game.screenHeight - minimap.height - minimap.overflow - 3,
    }
    minimap.pip_size = 5;
}

//conglomerate draw function for game objects
function drawGame () {
    if (socket.id in players) {
        let player = players[socket.id];

        push();

        //send movement data only if alive
        if (player.health > 0) {
            sendMove();
        }

        //refresh screen
        clear()

        //calculate screen offset based on player position
        calcOffset(player);

        //draw grid background
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

        //draw death message if client player is dead
        deathMsg(player);

        //draw UI

        //draw minimap
        drawMinimap();

        if (player.health > 0) {
            //draw healthbar, then erase time of death
            drawHealthbar(player);
            deathStart = 0;
        } else {
            //note time of death, then draw respawn bar
            if (deathStart == 0) {
                deathStart = (new Date()).getTime();
            }
            let deathTime = (new Date()).getTime() - deathStart;
            drawMainbar(player, deathTime/game.respawnTime);
        }

        //draw info about the current gameRoom
        drawRoomId(player);

        //draw names of players
        drawPlayerInfo();

        // draw crosshair
        drawCrosshair(player);


        pop();
    }
}

//calculate screen offset based on player position
function calcOffset (player) {
    screen_offset.x = Math.min(Math.max(0, player.x - game.screenWidth/2), game.width-game.screenWidth);
    screen_offset.y = Math.min(Math.max(0, player.y - game.screenHeight/2), game.height-game.screenHeight);
}

//draw grid to visually indicate movement around world
function drawGrid () {
    push();
    strokeWeight(1);
    stroke('#C2C3C7');
    background('#FFF1E8');
    for (let x = 100; x < game.width; x+=100) {
        if (x-screen_offset.x > 0 &&
            x-screen_offset.x < game.screenWidth) {
                line(
                    x-screen_offset.x, 0,
                    x-screen_offset.x, game.screenWidth
                );
        }
    }
    for (let y = 100; y < game.height; y+=100) {
            if (y-screen_offset.y > 0 &&
                y-screen_offset.y < game.screenHeight) {
                    line(
                        0, y-screen_offset.y,
                        game.screenHeight, y-screen_offset.y
                    );
            }
        }
    pop();
}

//draw all shots
function drawShots() {
    push();
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
    pop();
}

//draw dead players 
function drawDead () {
    push();
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
    pop();
}

//draw living players
function drawLiving () {
    push();
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
                    stroke(game.colorPairs[player.color][1]);
                    strokeWeight(2);
                    fill('black');
                    rect(
                        player.x - x_offset-screen_offset.x, player.y + y_offset-screen_offset.y, 
                        x_offset*2, 5*(y_offset/y_offset_abs),
                    );
                    strokeWeight(0);
                    fill(game.colorPairs[player.color][0]);
                    rect(
                        player.x - x_offset-screen_offset.x, player.y + y_offset-screen_offset.y, 
                        x_offset*2*(player.health/game.maxHealth), 5*(y_offset/y_offset_abs),
                    );
            }
        }
    }
    pop();
}

//draw client's player
function drawPlayer (player) {
    push();
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
    pop();
}

//tint screen and display message when player is dead
function deathMsg (player) {
    if (player.health <= 0) {
        push();
        textAlign(CENTER, CENTER);
        background(0, 200);
        fill(game.colorPairs[player.color][0]);
        stroke('black');
        strokeWeight(3);
        textSize(40);
        text("YOU ARE DEAD", game.screenWidth/2, game.screenHeight/2);
        pop();
    }
}

//draw cosshair
function drawCrosshair (player) {
    push();
    stroke(game.colorPairs[player.color][1]);
    strokeWeight(2);
    fill(0,0);
    ellipse(mouseX, mouseY, 30, 30);
    line(mouseX+20, mouseY, mouseX-20, mouseY);
    line(mouseX, mouseY+20, mouseX, mouseY-20);
    pop();
}

//draws the main bar at bottom of the screen
function drawMainbar (player, prog) {
    //prog is ratio from 0 to 1
    prog = Math.min(1,Math.max(0,prog));
    push();
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
    pop();
}

//draw client players healthbar
function drawHealthbar (player) {
    push();
    textAlign(CENTER, CENTER);
    drawMainbar(player, player.health/game.maxHealth);
    stroke('black');
    strokeWeight(4);
    textSize(20);
    fill('#FFF1E8');
    text(player.health.toString()+' / '+game.maxHealth.toString() ,game.screenWidth/2,game.screenHeight-17);
    pop();
}

//draws minimap 
function drawMinimap () {
    push();
    //draw minimap background
    strokeWeight(0);
    fill(0, 150);
    rect(
        minimap.offset.x - minimap.overflow,
        minimap.offset.y - minimap.overflow, 
        minimap.width + minimap.overflow*2, 
        minimap.height + minimap.overflow*2
    );

    //draw other player pips
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

    //draw client player pip with outline indicator + larger
    let player = players[socket.id];
    strokeWeight(1);
    stroke('#FFF1E8');
    fill(game.colorPairs[player.color][0]);
    ellipse(
        (player.x/game.width)*minimap.width + minimap.offset.x,
        (player.y/game.height)*minimap.height + minimap.offset.y,
        minimap.pip_size*1.25, minimap.pip_size*1.25,
    );
    pop();
}

//display room code so others can join
function drawRoomId (player) {
    push();
    textAlign(LEFT, CENTER);
    stroke('black');
    strokeWeight(0);
    textSize(30);
    fill(game.colorPairs[player.color][1]);
    text('Room Code: '+roomId, 15, 20);

    text('Players: '+Object.keys(players).length.toString()+'/'+game.roomCap, 15, 60)
    pop();
}

function drawPlayerInfo () {
    push();
    rectMode(CORNERS);
    textAlign(RIGHT, CENTER);
    stroke('black');
    strokeWeight(0);
    textSize(30);
    let counter = 0;
    for (let id in players) {
        //draw name and killstreak
        let player = players[id];
        fill(game.colorPairs[player.color][1]);
        text(player.name + ' : '+player.killStreak, game.screenWidth-15, 20+counter*50);
        
        //draw healthbar
        let barWidth = 110;
        let barHeight = 6;
        let barOffset = 15;
        fill('black');
        stroke(game.colorPairs[player.color][1]);
        strokeWeight(2);
        rect(
            game.screenWidth-(barWidth+barOffset), 40+counter*50, 
            game.screenWidth-(barOffset), 40+counter*50 + barHeight
        );
        strokeWeight(0);
        fill(game.colorPairs[player.color][0]);
        rect(
            game.screenWidth-barOffset - barWidth*(player.health/game.maxHealth), 40+counter*50, 
            game.screenWidth-(barOffset), 40+counter*50 + barHeight
        );

        counter++;
    }
    pop();
}