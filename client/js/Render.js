//code to render game
var Render = {

    //object to hold info re: screen offset based on player position
    screenOffset: {
        x:0,
        y:0,
    },

    //conglomerate draw function for game objects
    drawGame: function (socket, gameState) {

        push();

        //if player is actively playing
        if (socket.id in gameState.players.playing) {
            
            //get player object
            let player = gameState.players.playing[socket.id];

            //calculate screen offset based on player position
            Render.calcOffset(player);

            //draw grid background
            Render.drawGrid();

            //draw game area borders
            Render.drawBorders();

            //draw zones
            Render.drawZones(gameState);

            //draw dead players
            // Render.drawDead();

            //draw pickups
            Render.drawPickups(gameState);

            //draw shots
            Render.drawShots(gameState);

            //draw enemies
            Render.drawEnemies(gameState);

            //draw bosses
            Render.drawBosses(gameState);

            //draw living players
            Render.drawLiving(gameState);

            // then draw client player on top if living
            Render.drawPlayer(player);
        }

        //draw game if player not in game
        else {

            //calculate screen offset based on center of screen
            Render.calcOffset();

            //draw grid background
            Render.drawGrid();

            //draw game area borders
            Render.drawBorders();

            //draw zones
            Render.drawZones(gameState);

            //draw dead players
            // Render.drawDead();

            //draw pickups
            Render.drawPickups(gameState);

            //draw shots
            Render.drawShots(gameState);

            //draw enemies
            Render.drawEnemies(gameState);

            //draw bosses
            Render.drawBosses(gameState);

            //draw living players
            Render.drawLiving(gameState);
        }

        pop();
    },

    //calculate screen offset based on player position
    calcOffset: function (player) {

        //if no player, target center of game area
        if (player === undefined) {
            player = {
                x: gameSettings.width/2,
                y: gameSettings.height/2,
            }
        }

        let margin = 100;
        
        //account for screens too large for the game area
        if (windowWidth > gameSettings.width + 2*margin) {
            Render.screenOffset.x = (gameSettings.width-windowWidth)/2;
        }
        else {
            Render.screenOffset.x = Math.min(Math.max(-margin, player.x - windowWidth/2), gameSettings.width-windowWidth + margin);
        }
        if (windowHeight > gameSettings.height + 2*margin) {
            Render.screenOffset.y = (gameSettings.height-windowHeight)/2;
        }
        else {
            Render.screenOffset.y = Math.min(Math.max(-margin, player.y - windowHeight/2), gameSettings.height-windowHeight + margin);
        }
    },

    //draw grid to visually indicate movement around world
    drawGrid: function () {
        push();
        strokeWeight(1);
        stroke(gameSettings.colors.grey);
        background(gameSettings.colors.white);
        for (let x = 100; x < gameSettings.width; x+=100) {
            if (x-Render.screenOffset.x > 0 &&
                x-Render.screenOffset.x < windowWidth) {
                    line(
                        x-Render.screenOffset.x, 0,
                        x-Render.screenOffset.x, windowHeight
                    );
            }
        }
        for (let y = 100; y < gameSettings.height; y+=100) {
            if (y-Render.screenOffset.y > 0 &&
                y-Render.screenOffset.y < windowHeight) {
                    line(
                        0, y-Render.screenOffset.y,
                        windowWidth, y-Render.screenOffset.y
                    );
            }
        }
        pop();
    },

    //draws edge of game area
    drawBorders: function () {
        push();
        strokeWeight(0);
        fill(gameSettings.colors.grey);
        rectMode(CORNERS);
        //left
        if (Render.screenOffset.x < 0) {
            rect(
                0, 0, 
                -Render.screenOffset.x, windowHeight
            )
        }
        //right
        if (Render.screenOffset.x > gameSettings.width-windowWidth) {
            rect(
                gameSettings.width - Render.screenOffset.x, 0, 
                windowWidth, windowHeight
            )
        }
        //top
        if (Render.screenOffset.y < 0) {
            rect(
                0, 0, 
                windowWidth, -Render.screenOffset.y
            )
        }
        //bottom
        if (Render.screenOffset.y > gameSettings.height-windowHeight) {
            rect(
                0, gameSettings.height - Render.screenOffset.y, 
                windowWidth, windowHeight
            )
        }
        pop();
    },

    //for pickup color animation
    pickupProg: 0,

    pickupColors: [
        gameSettings.colors.blue,
        gameSettings.colors.green,
        gameSettings.colors.yellow,
        gameSettings.colors.pink
    ],

    //draws pickup-able objects
    drawPickups: function (gameState) {
        push();

        Render.pickupProg -= 0.5;
        let progColor = Render.pickupColors[Math.floor(-(Render.pickupProg/Render.pickupColors.length)%Render.pickupColors.length)];
        stroke(progColor);
        fill(gameSettings.colors.white);
        strokeWeight(4);
        for (let id in gameState.pickups) {
            let pickup = gameState.pickups[id];
            if (pickup.x-Render.screenOffset.x > -50 &&
                pickup.x-Render.screenOffset.x < windowWidth + 50 &&
                pickup.y-Render.screenOffset.y > -50 &&
                pickup.y-Render.screenOffset.y < windowHeight + 50) {
                    //draw circle
                    circle(
                        pickup.x-Render.screenOffset.x,
                        pickup.y-Render.screenOffset.y,
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
                            pickup.x-Render.screenOffset.x,
                            pickup.y-Render.screenOffset.y,
                            gameSettings.pickupRadius,
                            6
                        )
                        rect(
                            pickup.x-Render.screenOffset.x,
                            pickup.y-Render.screenOffset.y,
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
                            pickup.x-Render.screenOffset.x, 
                            pickup.y-Render.screenOffset.y - 3
                        );
                        pop();
                    }
            }
        }
        pop();
    },

    //draw all shots
    drawShots: function (gameState) {

        push();
        strokeWeight(2);

        //draw enemy shots
        for (let id in gameState.shots.enemyShots) {
            let shot = gameState.shots.enemyShots[id];
            if (shot.x-Render.screenOffset.x > 0 &&
                shot.x-Render.screenOffset.x < windowWidth &&
                shot.y-Render.screenOffset.y > 0 &&
                shot.y-Render.screenOffset.y < windowHeight) {
                    fill(gameSettings.enemyTypes[shot.type].colors.dark);
                    stroke(gameSettings.enemyTypes[shot.type].colors.light);
                    circle(
                        shot.x-Render.screenOffset.x, 
                        shot.y-Render.screenOffset.y, 
                        10,
                    );
            }
        }

        //draw boss shots
        for (let id in gameState.shots.bossShots) {
            let shot = gameState.shots.bossShots[id];
            if (shot.x-Render.screenOffset.x > 0 &&
                shot.x-Render.screenOffset.x < windowWidth &&
                shot.y-Render.screenOffset.y > 0 &&
                shot.y-Render.screenOffset.y < windowHeight) {
                    fill(gameSettings.boss.colors.light);
                    stroke(gameSettings.boss.colors.dark);
                    circle(
                        shot.x-Render.screenOffset.x, 
                        shot.y-Render.screenOffset.y, 
                        10,
                    );
            }
        }
        
        //draw player shots
        for (let id in gameState.shots.playerShots) {
            let shot = gameState.shots.playerShots[id];
            if (shot.x-Render.screenOffset.x > 0 &&
                shot.x-Render.screenOffset.x < windowWidth &&
                shot.y-Render.screenOffset.y > 0 &&
                shot.y-Render.screenOffset.y < windowHeight) {
                    fill(gameSettings.playerTypes[shot.type].colors.light);
                    stroke(gameSettings.playerTypes[shot.type].colors.dark);
                    circle(
                        shot.x-Render.screenOffset.x, 
                        shot.y-Render.screenOffset.y, 
                        10,
                    );
            }
        }

        pop();
    },

    //draw all enemies
    drawEnemies: function (gameState) {

        push();

        //draw enemies
        for (let id in gameState.enemies) {
            let enemy = gameState.enemies[id];
            if (enemy.x-Render.screenOffset.x > -50 &&
                enemy.x-Render.screenOffset.x < windowWidth + 50 &&
                enemy.y-Render.screenOffset.y > -50 &&
                enemy.y-Render.screenOffset.y < windowHeight + 50) {

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
                            -spineX + enemy.x - Render.screenOffset.x, 
                            -spineY + enemy.y - Render.screenOffset.y, 
                            spineX + enemy.x - Render.screenOffset.x, 
                            spineY + enemy.y - Render.screenOffset.y
                        );
                    }

                    //draw circle
                    circle(
                        enemy.x-Render.screenOffset.x,
                        enemy.y-Render.screenOffset.y,
                        gameSettings.enemyTypes[enemy.type].radius*2,
                    );
            }   
        }

        //draw healthbars
        for (let id in gameState.enemies) {
            let enemy = gameState.enemies[id];
            if (enemy.x-Render.screenOffset.x > -50 &&
                enemy.x-Render.screenOffset.x < windowWidth + 50 &&
                enemy.y-Render.screenOffset.y > -50 &&
                enemy.y-Render.screenOffset.y < windowHeight + 50) {

                    let x_offset = 15
                    let y_offset_abs = gameSettings.enemyTypes[enemy.type].radius + 10;
                    let y_offset = y_offset_abs;
                    if (enemy.y-Render.screenOffset.y > windowHeight - 50) {
                        y_offset = -y_offset_abs;
                    }
                    stroke(gameSettings.enemyTypes[enemy.type].colors.dark);
                    strokeWeight(2);
                    fill('black');
                    rect(
                        enemy.x - x_offset-Render.screenOffset.x, 
                        enemy.y + y_offset-Render.screenOffset.y, 
                        x_offset*2, 
                        5*(y_offset/y_offset_abs),
                    );
                    strokeWeight(0);
                    fill(gameSettings.enemyTypes[enemy.type].colors.light);
                    rect(
                        enemy.x - x_offset-Render.screenOffset.x, 
                        enemy.y + y_offset-Render.screenOffset.y, 
                        x_offset*2*(enemy.health/gameSettings.enemyTypes[enemy.type].maxHealth), 
                        5*(y_offset/y_offset_abs),
                    );
            }   
        }
        pop();
    },

    //draw bosses
    drawBosses: function (gameState) {

        push();

        //draw enemies
        for (let id in gameState.bosses) {
            let boss = gameState.bosses[id];
            if (boss.x-Render.screenOffset.x > -200 &&
                boss.x-Render.screenOffset.x < windowWidth + 200 &&
                boss.y-Render.screenOffset.y > -200 &&
                boss.y-Render.screenOffset.y < windowHeight + 200) {

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
                            -spineX + boss.x - Render.screenOffset.x, 
                            -spineY + boss.y - Render.screenOffset.y, 
                            spineX + boss.x - Render.screenOffset.x, 
                            spineY + boss.y - Render.screenOffset.y
                        );
                    }

                    //draw circle
                    circle(
                        boss.x - Render.screenOffset.x,
                        boss.y - Render.screenOffset.y,
                        gameSettings.boss.radius * 2,
                    );
            }   
        }

        pop();
    },

    //draw zones
    drawZones: function (gameState) {
        
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
                zone.x - Render.screenOffset.x, 
                zone.y - Render.screenOffset.y, 
                zone.radius*2
            );
        }

        pop();
    },

    // //draw dead players
    // drawDead: function () {

    //     push();

    //     for (let id in gameState.players.playing) {
    //         if (id != socket.id) {
    //             let player = gameState.players.playing[id];
    //             if (player.health <= 0 &&
    //                 player.x-Render.screenOffset.x > -50 &&
    //                 player.x-Render.screenOffset.x < windowWidth + 50 &&
    //                 player.y-Render.screenOffset.y > -50 &&
    //                 player.y-Render.screenOffset.y < windowHeight + 50) {
    //                     //draw player as transparent
    //                     let fillcolor = color(gameSettings.playerTypes[player.type].colors.light);
    //                     fillcolor.setAlpha(100);
    //                     let strokecolor = color(gameSettings.playerTypes[player.type].colors.dark);
    //                     strokecolor.setAlpha(100)
    //                     fill(fillcolor);
    //                     stroke(strokecolor);
    //                     strokeWeight(4);
    //                     circle(
    //                         player.x-Render.screenOffset.x, 
    //                         player.y-Render.screenOffset.y, 
    //                         gameSettings.playerTypes[player.type].radius*2 - 1, 
    //                     );
    //             }
    //         }
    //     }

    //     pop();
    // },

    //draw living players
    drawLiving: function (gameState) {

        push();

        //draw players
        for (let id in gameState.players.playing) {
            if (id != socket.id) {
                let player = gameState.players.playing[id];
                if (player.health > 0 &&
                    player.x-Render.screenOffset.x > -50 &&
                    player.x-Render.screenOffset.x < windowWidth + 50 &&
                    player.y-Render.screenOffset.y > -50 &&
                    player.y-Render.screenOffset.y < windowHeight + 50) {
                        
                        fill(gameSettings.playerTypes[player.type].colors.light);
                        stroke(gameSettings.playerTypes[player.type].colors.dark);
                        strokeWeight(4);
                        circle(
                            player.x-Render.screenOffset.x, 
                            player.y-Render.screenOffset.y, 
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
                    player.x-Render.screenOffset.x > -50 &&
                    player.x-Render.screenOffset.x < windowWidth + 50 &&
                    player.y-Render.screenOffset.y > -50 &&
                    player.y-Render.screenOffset.y < windowHeight + 50) {
                        let x_offset = 15
                        let y_offset_abs = gameSettings.playerTypes[player.type].radius + 10;
                        let y_offset = y_offset_abs;
                        // if (player.y-Render.screenOffset.y > windowHeight - 50) {
                        //     y_offset = -y_offset_abs;
                        // }
                        stroke(gameSettings.playerTypes[player.type].colors.dark);
                        strokeWeight(2);
                        fill('black');
                        rect(
                            player.x - x_offset-Render.screenOffset.x, 
                            player.y + y_offset-Render.screenOffset.y, 
                            x_offset*2, 
                            5*(y_offset/y_offset_abs),
                        );
                        strokeWeight(0);
                        fill(gameSettings.playerTypes[player.type].colors.light);
                        rect(
                            player.x - x_offset-Render.screenOffset.x, 
                            player.y + y_offset-Render.screenOffset.y, 
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
                    player.x-Render.screenOffset.x > -50 &&
                    player.x-Render.screenOffset.x < windowWidth + 50 &&
                    player.y-Render.screenOffset.y > -50 &&
                    player.y-Render.screenOffset.y < windowHeight + 50) {

                        let y_offset_abs = gameSettings.playerTypes[player.type].radius + 10;
                        let y_offset = -y_offset_abs;
                        
                        fill(gameSettings.playerTypes[player.type].colors.light);
                        stroke(gameSettings.playerTypes[player.type].colors.dark);

                        text(
                            player.name, 
                            player.x-Render.screenOffset.x,
                            player.y-Render.screenOffset.y+y_offset,
                        )
                }
            }
        }

        pop();
    },

    //draw client's player
    drawPlayer: function (player) {
        push();

        //draw living
        if (player.health > 0) {
            fill(gameSettings.playerTypes[player.type].colors.light);
            stroke(gameSettings.playerTypes[player.type].colors.dark);
            strokeWeight(4);
            circle(
                player.x-Render.screenOffset.x, 
                player.y-Render.screenOffset.y, 
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
                player.x-Render.screenOffset.x,
                player.y-Render.screenOffset.y+y_offset,
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
                player.x-Render.screenOffset.x, 
                player.y-Render.screenOffset.y, 
                gameSettings.playerTypes[player.type].radius*2 - 1, 
            );
        }
    }
}