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
    if (socket.id in gameState.players.playing) {
        
        //get player object
        let player = gameState.players.playing[socket.id];

        //calculate screen offset based on player position
        calcOffset(player);

        //draw grid background
        drawGrid();

        //draw game area borders
        drawBorders();

        //draw zones
        drawZones();

        //draw dead players
        drawDead();

        //draw pickups
        drawPickups();

        //draw shots
        drawShots();

        //draw enemies
        drawEnemies();

        //draw bosses
        drawBosses();

        //draw living players
        drawLiving();

        // then draw client player on top if living
        drawPlayer(player);

        //draw UI

        //draw player alive. draw health and ability bar
        drawHealthbar(player);
        drawAbilitybar(player);

        //draw boss healthbar
        drawBossbar();

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

        //draw zones
        drawZones();

        //draw dead players
        drawDead();

        //draw pickups
        drawPickups();

        //draw shots
        drawShots();

        //draw enemies
        drawEnemies();

        //draw bosses
        drawBosses();

        //draw living players
        drawLiving();

        //draw UI

        //draw boss healthbar
        drawBossbar();

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
    for (let id in gameState.pickups) {
        let pickup = gameState.pickups[id];
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
    for (let id in gameState.shots.enemyShots) {
        let shot = gameState.shots.enemyShots[id];
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

    //draw boss shots
    for (let id in gameState.shots.bossShots) {
        let shot = gameState.shots.bossShots[id];
        if (shot.x-screenOffset.x > 0 &&
            shot.x-screenOffset.x < windowWidth &&
            shot.y-screenOffset.y > 0 &&
            shot.y-screenOffset.y < windowHeight) {
                fill(gameSettings.boss.colors.light);
                stroke(gameSettings.boss.colors.dark);
                circle(
                    shot.x-screenOffset.x, 
                    shot.y-screenOffset.y, 
                    10,
                );
        }
    }
    
    //draw player shots
    for (let id in gameState.shots.playerShots) {
        let shot = gameState.shots.playerShots[id];
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
    for (let id in gameState.enemies) {
        let enemy = gameState.enemies[id];
        if (enemy.x-screenOffset.x > -50 &&
            enemy.x-screenOffset.x < windowWidth + 50 &&
            enemy.y-screenOffset.y > -50 &&
            enemy.y-screenOffset.y < windowHeight + 50) {

                //setup
                fill(gameSettings.enemyTypes[enemy.type].colors.dark);
                stroke(gameSettings.enemyTypes[enemy.type].colors.light);
                strokeWeight(4);

                //draw spines
                for (let i = 0; i < gameSettings.enemyTypes[enemy.type].spineCount; i++) {
                    let angle = Math.PI * (i/gameSettings.enemyTypes[enemy.type].spineCount);
                    let spineX = Math.cos(angle) * (gameSettings.enemyTypes[enemy.type].radius + gameSettings.enemyTypes[enemy.type].spineLength);
                    let spineY = Math.sin(angle) * (gameSettings.enemyTypes[enemy.type].radius + gameSettings.enemyTypes[enemy.type].spineLength);
                    line(
                        -spineX + enemy.x - screenOffset.x, 
                        -spineY + enemy.y - screenOffset.y, 
                        spineX + enemy.x - screenOffset.x, 
                        spineY + enemy.y - screenOffset.y
                    );
                }

                //draw circle
                circle(
                    enemy.x-screenOffset.x,
                    enemy.y-screenOffset.y,
                    gameSettings.enemyTypes[enemy.type].radius*2,
                );
        }   
    }

    //draw healthbars
    for (let id in gameState.enemies) {
        let enemy = gameState.enemies[id];
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

//draw bosses
function drawBosses () {

    push();

    //draw enemies
    for (let id in gameState.bosses) {
        let boss = gameState.bosses[id];
        if (boss.x-screenOffset.x > -200 &&
            boss.x-screenOffset.x < windowWidth + 200 &&
            boss.y-screenOffset.y > -200 &&
            boss.y-screenOffset.y < windowHeight + 200) {

                //setup
                fill(gameSettings.boss.colors.dark);
                stroke(gameSettings.boss.colors.light);
                strokeWeight(8);

                //draw spines
                for (let i = 0; i < gameSettings.boss.spineCount; i++) {
                    let angle = Math.PI * (i/gameSettings.boss.spineCount);
                    let spineX = Math.cos(angle) * (gameSettings.boss.radius + gameSettings.boss.spineLength);
                    let spineY = Math.sin(angle) * (gameSettings.boss.radius + gameSettings.boss.spineLength);
                    line(
                        -spineX + boss.x - screenOffset.x, 
                        -spineY + boss.y - screenOffset.y, 
                        spineX + boss.x - screenOffset.x, 
                        spineY + boss.y - screenOffset.y
                    );
                }

                //draw circle
                circle(
                    boss.x - screenOffset.x,
                    boss.y - screenOffset.y,
                    gameSettings.boss.radius * 2,
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
    strokeWeight(10);
    // fill(color(0,0,0,50));
    fill('black');

    //loop through every zone
    for (let id in gameState.zones) {
        let zone = gameState.zones[id];

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

    for (let id in gameState.players.playing) {
        if (id != socket.id) {
            let player = gameState.players.playing[id];
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
                    strokeWeight(4);
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
    for (let id in gameState.players.playing) {
        if (id != socket.id) {
            let player = gameState.players.playing[id];
            if (player.health > 0 &&
                player.x-screenOffset.x > -50 &&
                player.x-screenOffset.x < windowWidth + 50 &&
                player.y-screenOffset.y > -50 &&
                player.y-screenOffset.y < windowHeight + 50) {
                    
                    fill(gameSettings.playerTypes[player.type].colors.light);
                    stroke(gameSettings.playerTypes[player.type].colors.dark);
                    strokeWeight(4);
                    circle(
                        player.x-screenOffset.x, 
                        player.y-screenOffset.y, 
                        gameSettings.playerTypes[player.type].radius*2 - 1, 
                    );
            }
        }
    }

    //draw healthbar
    for (let id in gameState.players.playing) {
        if (id != socket.id) {
            let player = gameState.players.playing[id];
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
    strokeWeight(4);
    textAlign(CENTER, BOTTOM);
    textSize(22);
    for (let id in gameState.players.playing) {
        if (id != socket.id) {
            let player = gameState.players.playing[id];
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
        strokeWeight(4);
        circle(
            player.x-screenOffset.x, 
            player.y-screenOffset.y, 
            gameSettings.playerTypes[player.type].radius*2 - 1, 
        );

        //draw name
        strokeWeight(4);
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
        strokeWeight(4);
        circle(
            player.x-screenOffset.x, 
            player.y-screenOffset.y, 
            gameSettings.playerTypes[player.type].radius*2 - 1, 
        );
    }
}

//draws the main bar at bottom of the screen
function drawBar (options) {

    //set defaults for options
    let defaults = {
        x: 0,
        y: 0,
        width: 100,
        height: 10,
        color: 'white',
        prog: 0.5,
        leftText: '',
        rightText: '',
        fontSize: 25,
    }

    if(!options) {options = {}};

    for (let option in defaults) {
        if (options[option] === undefined) {
            options[option] = defaults[option];
        }
    }

    //prog is ratio from 0 to 1
    options.prog = Math.min(1,Math.max(0, options.prog));

    push();
    
    //draw bar
    fill('black');
    strokeWeight(0);
    rect(
        options.x-options.width/2, options.y-options.height/2,
        options.width, options.height,
    );
    fill(options.color);
    rect(
        options.x-options.width/2+2, options.y - options.height/2 + 2,
        (options.width-4)*(options.prog), options.height-4
    );

    //draw texts
    stroke('black');
    strokeWeight(4);
    textSize(options.fontSize);
    fill(gameSettings.colors.white);

    //first text (left side)
    textAlign(LEFT, CENTER);
    text(
        options.leftText,
        options.x - options.width/2 + 8,
        options.y - options.height/2 + (options.height-4)/2
    );

    //second text(right side)
    textAlign(RIGHT, CENTER);
    text(
        options.rightText,
        options.x + options.width/2 - 8,
        options.y - options.height/2 + (options.height-4)/2
    );

    pop();
}

//draw client player healthbar
function drawHealthbar (player) {

    drawBar({
        x: windowWidth*3/8 - 10,
        y: windowHeight - 40,
        width: windowWidth/4,
        height: 40,
        color: gameSettings.playerTypes[player.type].colors.light,
        prog: player.health/gameSettings.playerTypes[player.type].maxHealth,
        leftText: 'Health',
        rightText: player.health.toString()+' / '+ gameSettings.playerTypes[player.type].maxHealth.toString(),
    })
}

//draw client player ability progress bar
function drawAbilitybar (player) {
    let color = gameSettings.colors.red;
    if (player.abilityProgress == gameSettings.abilityCap){
        color = gameSettings.colors.mango;
    }
    drawBar({
        x: windowWidth*5/8 + 10,
        y: windowHeight - 40,
        width: windowWidth/4,
        height: 40,
        color: color,
        prog: player.abilityProgress/gameSettings.abilityCap,
        leftText: 'Ability',
        rightText: player.abilityProgress.toString()+' / '+ gameSettings.abilityCap.toString(),
    })
}

//draw boss's healthbar
function drawBossbar () {
    //only draw in boss exists
    if (Object.keys(gameState.bosses).length > 0) {
        let boss = gameState.bosses[Object.keys(gameState.bosses)[0]];
        drawBar({
            x: windowWidth/2,
            y: 40,
            width: windowWidth/2,
            height: 40,
            color: gameSettings.boss.colors.light,
            prog: boss.health/boss.maxHealth,
            leftText: 'Boss',
            rightText: boss.health.toString()+' / '+ boss.maxHealth.toString(),
        })
    }
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
    for (let id in gameState.zones) {
        let zone = gameState.zones[id];
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

    //reguklar pips dont need outline
    strokeWeight(0);

    //draw enemy pips
    fill(gameSettings.colors.red);
    for (let id in gameState.enemies) {
        let enemy = gameState.enemies[id];
        circle(
            (enemy.x/gameSettings.width)*minimapWidth + minimapOffset.x,
            (enemy.y/gameSettings.height)*minimapHeight + minimapOffset.y,
            minimapPipSize,
        );
    }

    //draw boss pips
    fill(gameSettings.colors.red);
    for (let id in gameState.bosses) {
        let boss = gameState.bosses[id];
        circle(
            (boss.x/gameSettings.width)*minimapWidth + minimapOffset.x,
            (boss.y/gameSettings.height)*minimapHeight + minimapOffset.y,
            minimapPipSize*2.25,
        );
    }

    //draw other player pips
    for (let id in gameState.players.playing) {
        if (id != socket.id && gameState.players.playing[id].health > 0) {
            let player = gameState.players.playing[id];
            fill(gameSettings.playerTypes[player.type].colors.light);
            circle(
                (player.x/gameSettings.width)*minimapWidth + minimapOffset.x,
                (player.y/gameSettings.height)*minimapHeight + minimapOffset.y,
                minimapPipSize,
            );
        }
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

    let playerCount = Object.keys(gameState.players.playing).length + Object.keys(gameState.players.waiting).length;

    text(`Players: ${playerCount}/${gameSettings.roomCap}`, 15, 60);

    text(`Wave: ${gameState.roomInfo.waveCount}`, 15 ,100);

    //draw lives as red if none left
    if (gameState.roomInfo.livesCount <= 0) {
        fill(gameSettings.colors.red);
    }
    text(`Lives: ${gameState.roomInfo.livesCount}`, 15, 140);
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
    let sortedPlaying = Object.keys(gameState.players.playing).sort();
    for (let id of sortedPlaying) {
        
        let player = gameState.players.playing[id];

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

    let sortedWaiting = Object.keys(gameState.players.waiting).sort();
    for (let id of sortedWaiting) {
        
        let player = gameState.players.waiting[id];

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
    if (gameState.roomInfo.waveTimer > 0 &&
        Object.keys(gameState.zones).length == 0 &&
        Object.keys(gameState.bosses).length == 0) {

            let countdownNum = Math.ceil(gameState.roomInfo.waveTimer/1000);

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