//game info from server
var gameData = {};

//holds info of playing and waiting players
var playingData = {};
var waitingData = {};

//info for other game objects
var shotData = {};
var enemyShotData = {};
var pickupData = {};
var enemyData = {};
var zoneData = {};

//object to hold info re: screen offset based on player position
var screenOffset = {
    x:0,
    y:0,
}

//conglomerate draw function for game objects
function drawGame () {
    push();

    //refresh screen
    clear();

    //if player is actively playing
    if (socket.id in playingData) {
        
        //get player object
        let player = playingData[socket.id];

        //calculate screen offset based on player position
        calcOffset(player);

        //draw grid background
        drawGrid();

        //draw game area borders
        drawBorders();

        //draw dead players
        drawDead();

        //draw client player if dead
        if (player.health <= 0) {
            drawPlayer(player);
        }

        //draw pickups
        drawPickups();

        //draw shots
        drawShots();

        //draw enemies
        drawEnemies();

        //draw zones
        drawZones();

        //draw living players
        drawLiving();

        // then draw client player on top if living
        if (player.health > 0) {
            drawPlayer(player);
            drawHealthbar(player);
        }

        //draw UI

        //draw minimap
        drawMinimap(player);

        //draw info about the current Room
        drawRoomInfo(gameSettings.playerTypes[player.type].colors.dark);

        //draw names of players
        drawPlayerInfo();

        //draw countdown to next wave
        drawWaveCountdown();

        //draw fps counter
        drawFPSandPing(gameSettings.playerTypes[player.type].colors.dark);

        // draw crosshair
        drawCrosshair(gameSettings.playerTypes[player.type].colors.dark);

    }

    //draw game if player not in game
    else {

        //calculate screen offset based on center of screen
        calcOffset({
            x: gameSettings.width/2,
            y: gameSettings.height/2
        });

        //draw grid background
        drawGrid();

        //draw game area borders
        drawBorders();

        //draw dead players
        drawDead();

        //draw pickups
        drawPickups();

        //draw shots
        drawShots();

        //draw enemies
        drawEnemies();

        //draw zones
        drawZones();

        //draw living players
        drawLiving();

        //draw UI

        //draw minimap
        drawMinimap();

        //draw info about the current Room
        drawRoomInfo(gameSettings.colors.darkgrey);

        //draw names of players
        drawPlayerInfo();

        //draw countdown to next wave
        drawWaveCountdown();

        //draw fps counter
        drawFPSandPing(gameSettings.colors.darkgrey);

        // draw crosshair
        drawCrosshair(gameSettings.colors.darkgrey);
    }

    pop();
}

//calculate screen offset based on player position
function calcOffset (player) {

    let margin = 100;
    
    //account for screens too large for the game area
    if (windowWidth > gameSettings.width + 2*margin) {
        screenOffset.x = (gameSettings.width-windowWidth)/2;
    }
    else {
        screenOffset.x = Math.min(Math.max(-margin, player.x - windowWidth/2), gameSettings.width-windowWidth + margin);
    }
    if (windowHeight > gameSettings.height + 2*margin) {
        screenOffset.y = (gameSettings.height-windowHeight)/2;
    }
    else {
        screenOffset.y = Math.min(Math.max(-margin, player.y - windowHeight/2), gameSettings.height-windowHeight + margin);
    }
}

//draw grid to visually indicate movement around world
function drawGrid () {
    push();
    strokeWeight(1);
    stroke(gameSettings.colors.grey);
    background(gameSettings.colors.white);
    for (let x = 100; x < gameSettings.width; x+=100) {
        if (x-screenOffset.x > 0 &&
            x-screenOffset.x < windowWidth) {
                line(
                    x-screenOffset.x, 0,
                    x-screenOffset.x, windowHeight
                );
        }
    }
    for (let y = 100; y < gameSettings.height; y+=100) {
        if (y-screenOffset.y > 0 &&
            y-screenOffset.y < windowHeight) {
                line(
                    0, y-screenOffset.y,
                    windowWidth, y-screenOffset.y
                );
        }
    }
    pop();
}

//draws edge of game area
function drawBorders () {
    push();
    strokeWeight(0);
    fill(gameSettings.colors.grey);
    rectMode(CORNERS);
    //left
    if (screenOffset.x < 0) {
        rect(
            0, 0, 
            -screenOffset.x, windowHeight
        )
    }
    //right
    if (screenOffset.x > gameSettings.width-windowWidth) {
        rect(
            gameSettings.width - screenOffset.x, 0, 
            windowWidth, windowHeight
        )
    }
    //top
    if (screenOffset.y < 0) {
        rect(
            0, 0, 
            windowWidth, -screenOffset.y
        )
    }
    //bottom
    if (screenOffset.y > gameSettings.height-windowHeight) {
        rect(
            0, gameSettings.height - screenOffset.y, 
            windowWidth, windowHeight
        )
    }
    pop();
}


//for pickup color animation
var pickupProg = 0;
var pickupColors = [
    gameSettings.colors.blue,
    gameSettings.colors.green,
    gameSettings.colors.yellow,
    gameSettings.colors.pink
];

//draws pickup-able objects
function drawPickups() {
    push();

    pickupProg -= 0.5;
    let progColor = pickupColors[Math.floor(-(pickupProg/pickupColors.length)%pickupColors.length)];
    stroke(progColor);
    fill(gameSettings.colors.white);
    strokeWeight(4);
    for (let id in pickupData) {
        let pickup = pickupData[id];
        if (pickup.x-screenOffset.x > -50 &&
            pickup.x-screenOffset.x < windowWidth + 50 &&
            pickup.y-screenOffset.y > -50 &&
            pickup.y-screenOffset.y < windowHeight + 50) {
                //draw circle
                circle(
                    pickup.x-screenOffset.x,
                    pickup.y-screenOffset.y,
                    gameSettings.pickupRadius*2,
                )
                //health pickups
                if (pickup.type == 'health') {
                    //draw cross
                    push();
                    fill(gameSettings.colors.red);
                    strokeWeight(0);
                    rectMode(CENTER);
                    rect(
                        pickup.x-screenOffset.x,
                        pickup.y-screenOffset.y,
                        gameSettings.pickupRadius,
                        6
                    )
                    rect(
                        pickup.x-screenOffset.x,
                        pickup.y-screenOffset.y,
                        6,
                        gameSettings.pickupRadius
                    )
                    pop();
                }

                else if (pickup.type == 'life') {
                    push();
                    fill(progColor);
                    strokeWeight(4);
                    stroke(gameSettings.colors.black);
                    textAlign(CENTER, CENTER);
                    textSize(30);
                    text(
                        '+1', 
                        pickup.x-screenOffset.x, 
                        pickup.y-screenOffset.y - 3
                    );
                    pop();
                }
        }
    }
    pop();
}

//draw all shots
function drawShots() {

    push();
    strokeWeight(2);

    //draw enemy shots
    for (let id in enemyShotData) {
        let shot = enemyShotData[id];
        if (shot.x-screenOffset.x > 0 &&
            shot.x-screenOffset.x < windowWidth &&
            shot.y-screenOffset.y > 0 &&
            shot.y-screenOffset.y < windowHeight) {
                fill(gameSettings.enemyTypes[shot.type].colors.dark);
                stroke(gameSettings.enemyTypes[shot.type].colors.light);
                circle(
                    shot.x-screenOffset.x, 
                    shot.y-screenOffset.y, 
                    10,
                );
        }
    }
    
    //draw player shots
    for (let id in shotData) {
        let shot = shotData[id];
        if (shot.x-screenOffset.x > 0 &&
            shot.x-screenOffset.x < windowWidth &&
            shot.y-screenOffset.y > 0 &&
            shot.y-screenOffset.y < windowHeight) {
                fill(gameSettings.playerTypes[shot.type].colors.light);
                stroke(gameSettings.playerTypes[shot.type].colors.dark);
                circle(
                    shot.x-screenOffset.x, 
                    shot.y-screenOffset.y, 
                    10,
                );
        }
    }

    pop();
}

//draw all enemies
function drawEnemies() {

    push();

    //draw enemies
    for (let id in enemyData) {
        let enemy = enemyData[id];
        if (enemy.x-screenOffset.x > -50 &&
            enemy.x-screenOffset.x < windowWidth + 50 &&
            enemy.y-screenOffset.y > -50 &&
            enemy.y-screenOffset.y < windowHeight + 50) {

                //draw circle
                fill(gameSettings.enemyTypes[enemy.type].colors.dark);
                stroke(gameSettings.enemyTypes[enemy.type].colors.light);
                strokeWeight(2);
                circle(
                    enemy.x-screenOffset.x,
                    enemy.y-screenOffset.y,
                    gameSettings.enemyTypes[enemy.type].radius*2,
                );
        }   
    }

    //draw healthbars
    for (let id in enemyData) {
        let enemy = enemyData[id];
        if (enemy.x-screenOffset.x > -50 &&
            enemy.x-screenOffset.x < windowWidth + 50 &&
            enemy.y-screenOffset.y > -50 &&
            enemy.y-screenOffset.y < windowHeight + 50) {
                let x_offset = 15
                let y_offset_abs = gameSettings.enemyTypes[enemy.type].radius + 10;
                let y_offset = y_offset_abs;
                if (enemy.y-screenOffset.y > windowHeight - 50) {
                    y_offset = -y_offset_abs;
                }
                stroke(gameSettings.enemyTypes[enemy.type].colors.dark);
                strokeWeight(2);
                fill('black');
                rect(
                    enemy.x - x_offset-screenOffset.x, 
                    enemy.y + y_offset-screenOffset.y, 
                    x_offset*2, 
                    5*(y_offset/y_offset_abs),
                );
                strokeWeight(0);
                fill(gameSettings.enemyTypes[enemy.type].colors.light);
                rect(
                    enemy.x - x_offset-screenOffset.x, 
                    enemy.y + y_offset-screenOffset.y, 
                    x_offset*2*(enemy.health/gameSettings.enemyTypes[enemy.type].maxHealth), 
                    5*(y_offset/y_offset_abs),
                );
        }   
    }
    pop();
}

//draw zones
function drawZones () {
    
    push();

    //set up look
    stroke('black');
    strokeWeight(3);
    fill(color(50,50,50,50));

    //loop through every zone
    for (let id in zoneData) {
        let zone = zoneData[id];

        //check if zone is closing
        if (zone.closing > 0) {
            stroke(gameSettings.colors.green);
        }
        else {
            stroke(gameSettings.colors.red);
        }

        //draw zones
        circle(
            zone.x - screenOffset.x, 
            zone.y - screenOffset.y, 
            zone.radius*2
        );
    }

    pop();
}

//draw dead players
function drawDead () {

    push();

    for (let id in playingData) {
        if (id != socket.id) {
            let player = playingData[id];
            if (player.health <= 0 &&
                player.x-screenOffset.x > -50 &&
                player.x-screenOffset.x < windowWidth + 50 &&
                player.y-screenOffset.y > -50 &&
                player.y-screenOffset.y < windowHeight + 50) {
                    //draw player as transparent
                    let fillcolor = color(gameSettings.playerTypes[player.type].colors.light);
                    fillcolor.setAlpha(100);
                    let strokecolor = color(gameSettings.playerTypes[player.type].colors.dark);
                    strokecolor.setAlpha(100)
                    fill(fillcolor);
                    stroke(strokecolor);
                    strokeWeight(2);
                    circle(
                        player.x-screenOffset.x, 
                        player.y-screenOffset.y, 
                        gameSettings.playerTypes[player.type].radius*2 - 1, 
                    );
            }
        }
    }

    pop();
}

//draw living players
function drawLiving () {

    push();

    //draw players
    for (let id in playingData) {
        if (id != socket.id) {
            let player = playingData[id];
            if (player.health > 0 &&
                player.x-screenOffset.x > -50 &&
                player.x-screenOffset.x < windowWidth + 50 &&
                player.y-screenOffset.y > -50 &&
                player.y-screenOffset.y < windowHeight + 50) {
                    
                    fill(gameSettings.playerTypes[player.type].colors.light);
                    stroke(gameSettings.playerTypes[player.type].colors.dark);
                    strokeWeight(2);
                    circle(
                        player.x-screenOffset.x, 
                        player.y-screenOffset.y, 
                        gameSettings.playerTypes[player.type].radius*2 - 1, 
                    );
            }
        }
    }

    //draw healthbar
    for (let id in playingData) {
        if (id != socket.id) {
            let player = playingData[id];
            if (player.health > 0 &&
                player.x-screenOffset.x > -50 &&
                player.x-screenOffset.x < windowWidth + 50 &&
                player.y-screenOffset.y > -50 &&
                player.y-screenOffset.y < windowHeight + 50) {
                    let x_offset = 15
                    let y_offset_abs = gameSettings.playerTypes[player.type].radius + 10;
                    let y_offset = y_offset_abs;
                    // if (player.y-screenOffset.y > windowHeight - 50) {
                    //     y_offset = -y_offset_abs;
                    // }
                    stroke(gameSettings.playerTypes[player.type].colors.dark);
                    strokeWeight(2);
                    fill('black');
                    rect(
                        player.x - x_offset-screenOffset.x, 
                        player.y + y_offset-screenOffset.y, 
                        x_offset*2, 
                        5*(y_offset/y_offset_abs),
                    );
                    strokeWeight(0);
                    fill(gameSettings.playerTypes[player.type].colors.light);
                    rect(
                        player.x - x_offset-screenOffset.x, 
                        player.y + y_offset-screenOffset.y, 
                        x_offset*2*(player.health/gameSettings.playerTypes[player.type].maxHealth), 
                        5*(y_offset/y_offset_abs),
                    );
            }
        }
    }

    //draw names
    strokeWeight(2);
    textAlign(CENTER, BOTTOM);
    textSize(22);
    for (let id in playingData) {
        if (id != socket.id) {
            let player = playingData[id];
            if (player.health > 0 &&
                player.x-screenOffset.x > -50 &&
                player.x-screenOffset.x < windowWidth + 50 &&
                player.y-screenOffset.y > -50 &&
                player.y-screenOffset.y < windowHeight + 50) {

                    let y_offset_abs = gameSettings.playerTypes[player.type].radius + 10;
                    let y_offset = -y_offset_abs;
                    
                    fill(gameSettings.playerTypes[player.type].colors.light);
                    stroke(gameSettings.playerTypes[player.type].colors.dark);

                    text(
                        player.name, 
                        player.x-screenOffset.x,
                        player.y-screenOffset.y+y_offset,
                    )
            }
        }
    }

    pop();
}

//draw client's player
function drawPlayer (player) {
    push();

    //draw living
    if (player.health > 0) {
        fill(gameSettings.playerTypes[player.type].colors.light);
        stroke(gameSettings.playerTypes[player.type].colors.dark);
        strokeWeight(2);
        circle(
            player.x-screenOffset.x, 
            player.y-screenOffset.y, 
            gameSettings.playerTypes[player.type].radius*2 - 1, 
        );

        //draw name
        textAlign(CENTER, BOTTOM);
        textSize(22);
        
        let y_offset_abs = gameSettings.playerTypes[player.type].radius + 10;
        let y_offset = -y_offset_abs;
        
        fill(gameSettings.playerTypes[player.type].colors.light);
        stroke(gameSettings.playerTypes[player.type].colors.dark);

        text(
            player.name, 
            player.x-screenOffset.x,
            player.y-screenOffset.y+y_offset,
        )
    }
    
    //draw player as transparent if dead
    else {
        let fillcolor = color(gameSettings.playerTypes[player.type].colors.light);
        fillcolor.setAlpha(100);
        let strokecolor = color(gameSettings.playerTypes[player.type].colors.dark);
        strokecolor.setAlpha(100)
        fill(fillcolor);
        stroke(strokecolor);
        strokeWeight(2);
        circle(
            player.x-screenOffset.x, 
            player.y-screenOffset.y, 
            gameSettings.playerTypes[player.type].radius*2 - 1, 
        );
    }
}

//draws the main bar at bottom of the screen
function drawMainbar (color, prog) {
    //prog is ratio from 0 to 1
    prog = Math.min(1,Math.max(0,prog));
    push();
    strokeWeight(0);
    fill('black');
    rect(
        windowWidth/4-2, windowHeight - 27,
        windowWidth/2+4, 24,
    );
    fill(color);
    rect(
        windowWidth/4, windowHeight - 25,
        windowWidth/2*(prog), 20
    );
    pop();
}

//draw client player healthbar
function drawHealthbar (player) {
    push();
    textAlign(CENTER, CENTER);
    drawMainbar(
        gameSettings.playerTypes[player.type].colors.light, 
        player.health/gameSettings.playerTypes[player.type].maxHealth
    );
    stroke('black');
    strokeWeight(4);
    textSize(20);
    fill(gameSettings.colors.white);
    text(player.health.toString()+' / '+gameSettings.playerTypes[player.type].maxHealth.toString() ,windowWidth/2,windowHeight-17);
    pop();
}

//draws minimap, player argument optional
function drawMinimap (player) {

    //settings for the minimap
    let minimapWidth = Math.min(250, Math.max(windowWidth/6, windowHeight/6));
    let minimapHeight = (minimapWidth/gameSettings.width) * gameSettings.height;
    let minimapOverflow = 3;
    let minimapOffset = {
        x:minimapOverflow + 3,
        y:windowHeight - minimapHeight - minimapOverflow - 3,
    }
    let minimapPipSize = 5;

    push();
    //draw minimap background
    strokeWeight(2);
    stroke('black');
    fill(0, 150);
    rect(
        minimapOffset.x - minimapOverflow,
        minimapOffset.y - minimapOverflow, 
        minimapWidth + minimapOverflow*2, 
        minimapHeight + minimapOverflow*2
    );

    //draw zones
    strokeWeight(1);
    fill(color(50,50,50,50));
    for (let id in zoneData) {
        let zone = zoneData[id];
        if (zone.closing > 0) {
            stroke(gameSettings.colors.green);
        }
        else {
            stroke(gameSettings.colors.red);
        }
        circle(
            (zone.x/gameSettings.width)*minimapWidth + minimapOffset.x,
            (zone.y/gameSettings.height)*minimapHeight + minimapOffset.y,
            zone.radius*2*(minimapWidth/gameSettings.width),
        );
    }

    //draw other player pips
    strokeWeight(0);
    for (let id in playingData) {
        if (id != socket.id && playingData[id].health > 0) {
            let player = playingData[id];
            fill(gameSettings.playerTypes[player.type].colors.light);
            circle(
                (player.x/gameSettings.width)*minimapWidth + minimapOffset.x,
                (player.y/gameSettings.height)*minimapHeight + minimapOffset.y,
                minimapPipSize,
            );
        }
    }

    //draw enemy pips
    fill(gameSettings.colors.red);
    for (let id in enemyData) {
        let enemy = enemyData[id];
        circle(
            (enemy.x/gameSettings.width)*minimapWidth + minimapOffset.x,
            (enemy.y/gameSettings.height)*minimapHeight + minimapOffset.y,
            minimapPipSize,
        );
    }

    //draw client player pip with outline indicator + larger
    if (player != null) {
        strokeWeight(2);
        stroke(gameSettings.colors.white);
        fill(gameSettings.playerTypes[player.type].colors.light);
        circle(
            (player.x/gameSettings.width)*minimapWidth + minimapOffset.x,
            (player.y/gameSettings.height)*minimapHeight + minimapOffset.y,
            minimapPipSize*1.25,
        );
    }
    
    pop();
}

//display room code + info so others can join
function drawRoomInfo (color) {
    push();
    textAlign(LEFT, CENTER);
    stroke('black');
    strokeWeight(0);
    textSize(30);
    fill(color);
    text(`Game Code: ${roomId}`, 15, 20);

    let playerCount = Object.keys(playingData).length + Object.keys(waitingData).length;

    text(`Players: ${playerCount}/${gameSettings.roomCap}`, 15, 60);

    text(`Wave: ${gameData.waveCount}`, 15 ,100);

    //draw lives as red if none left
    if (gameData.livesCount <= 0) {
        fill(gameSettings.colors.red);
    }
    text(`Lives: ${gameData.livesCount}`, 15, 140);
    pop();
}

//draw name, killstreak, and healthbar for each player
function drawPlayerInfo () {
    push();
    rectMode(CORNERS);
    textAlign(RIGHT, CENTER);
    stroke('black');
    strokeWeight(0);
    textSize(30);
    let counter = 0;

    //draw living players first
    let sortedPlaying = Object.keys(playingData).sort();
    for (let id of sortedPlaying) {
        
        let player = playingData[id];

        //draw name and killstreak
        fill(gameSettings.playerTypes[player.type].colors.dark);
        text(player.name + ' : '+player.killStreak, windowWidth-15, 20+counter*50);
        
        //draw healthbar
        let barWidth = 110;
        let barHeight = 6;
        let barOffset = 15;
        fill('black');
        stroke(gameSettings.playerTypes[player.type].colors.dark);
        strokeWeight(2);
        rect(
            windowWidth-(barWidth+barOffset), 40+counter*50, 
            windowWidth-(barOffset), 40+counter*50 + barHeight
        );
        strokeWeight(0);
        fill(gameSettings.playerTypes[player.type].colors.light);
        rect(
            windowWidth-barOffset - barWidth*(player.health/gameSettings.playerTypes[player.type].maxHealth), 40+counter*50, 
            windowWidth-(barOffset), 40+counter*50 + barHeight
        );

        counter++;
    }

    let sortedWaiting = Object.keys(waitingData).sort();
    for (let id of sortedWaiting) {
        
        let player = waitingData[id];

        //draw name and killstreak
        fill(gameSettings.colors.darkgrey);
        text(player.name + ' : '+player.killStreak, windowWidth-15, 20+counter*50);
        
        //draw healthbar
        let barWidth = 110;
        let barHeight = 6;
        let barOffset = 15;
        fill('black');
        stroke(gameSettings.colors.darkgrey);
        strokeWeight(2);
        rect(
            windowWidth-(barWidth+barOffset), 40+counter*50, 
            windowWidth-(barOffset), 40+counter*50 + barHeight
        );
        strokeWeight(0);
        if (player.respawnTimer == 0) {
            fill(gameSettings.colors.white);
        }
        else {
            fill(gameSettings.colors.red);
        }
        rect(
            windowWidth-barOffset - barWidth*(1-(player.respawnTimer/gameSettings.respawnTime)), 40+counter*50, 
            windowWidth-(barOffset), 40+counter*50 + barHeight
        );

        counter++;
    }

    pop();
}

//draw countdown to next wave
function drawWaveCountdown () {

    push();

    //make sure countdown is going
    if (gameData.waveTimer > 0 &&
        Object.keys(zoneData).length == 0) {

            let countdownNum = Math.ceil(gameData.waveTimer/1000);

            textAlign(CENTER, CENTER);
            textSize(75);
            stroke(0);
            fill('black');

            text(
                countdownNum,
                windowWidth/2,
                windowHeight/4,
            );
    }

    pop();
}

var fpsList = [];

//draw framerate
function drawFPSandPing (color) {
    //add fps to list
    fpsList.push(frameRate());
    //remove oldest if above 0.5 seconds
    if (fpsList.length > 500/gameSettings.tickRate) {
        fpsList.shift();
    }

    //round and average the list
    let fpsSum = fpsList.reduce((a,b) => a+b);
    let fpsMean = (fpsSum/fpsList.length);
    let fps = fpsMean.toFixed(0);

    push();
    textAlign(RIGHT, CENTER);
    textSize(30);
    strokeWeight(0);
    fill(color);
    //draw fps
    text(
        `FPS: ${fps}`, 
        windowWidth-15, 
        windowHeight-30,
    );
    //draw ping
    let ms = Ping.value;
    text(
        `Ping: ${ms}`,
        windowWidth-15,
        windowHeight-70,
    );
    pop();
}

//draw cosshair
function drawCrosshair (color) {
    push();
    stroke(color);
    strokeWeight(2);
    fill(0,0);
    circle(mouseX, mouseY, 30);
    line(mouseX+20, mouseY, mouseX-20, mouseY);
    line(mouseX, mouseY+20, mouseX, mouseY-20);
    pop();
}