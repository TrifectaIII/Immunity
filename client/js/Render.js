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
            this.calcOffset(player);

            //draw grid background
            this.drawGrid();

            //draw game area borders
            this.drawBorders();

            //draw zones
            this.drawZones(gameState);

            //draw dead players
            // this.drawDead();

            //draw pickups
            this.drawPickups(gameState);

            //draw shots
            this.drawShots(gameState);

            //draw enemies
            this.drawEnemies(gameState);

            //draw bosses
            this.drawBosses(gameState);

            //draw living players
            this.drawLiving(gameState);

            // then draw client player on top of living
            this.drawPlayer(player);

            //draw abilities after players
            this.drawAbilities(gameState);

            //draw player names
            this.drawNames(gameState);
        }

        //draw game if player not in game
        else {

            //calculate screen offset based on center of screen
            this.calcOffset();

            //draw grid background
            this.drawGrid();

            //draw game area borders
            this.drawBorders();

            //draw zones
            this.drawZones(gameState);

            //draw dead players
            // this.drawDead();

            //draw pickups
            this.drawPickups(gameState);

            //draw shots
            this.drawShots(gameState);

            //draw enemies
            this.drawEnemies(gameState);

            //draw bosses
            this.drawBosses(gameState);

            //draw living players
            this.drawLiving(gameState);

            //draw abilities after players
            this.drawAbilities(gameState);

            //draw player names
            this.drawNames(gameState);
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
        if (width > gameSettings.width + 2*margin) {
            this.screenOffset.x = (gameSettings.width-width)/2;
        }
        else {
            this.screenOffset.x = Math.min(Math.max(-margin, player.x - width/2), gameSettings.width-width + margin);
        }
        if (height > gameSettings.height + 2*margin) {
            this.screenOffset.y = (gameSettings.height-height)/2;
        }
        else {
            this.screenOffset.y = Math.min(Math.max(-margin, player.y - height/2), gameSettings.height-height + margin);
        }
    },

    //draw grid to visually indicate movement around world
    drawGrid: function () {
        push();
        strokeWeight(1);
        stroke(gameSettings.colors.grey);
        background(gameSettings.colors.white);
        for (let x = 100; x < gameSettings.width; x+=100) {
            if (x-this.screenOffset.x > 0 &&
                x-this.screenOffset.x < width) {
                    line(
                        x-this.screenOffset.x, 0,
                        x-this.screenOffset.x, height
                    );
            }
        }
        for (let y = 100; y < gameSettings.height; y+=100) {
            if (y-this.screenOffset.y > 0 &&
                y-this.screenOffset.y < height) {
                    line(
                        0, y-this.screenOffset.y,
                        width, y-this.screenOffset.y
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
        if (this.screenOffset.x < 0) {
            rect(
                0, 0, 
                -this.screenOffset.x, height
            )
        }
        //right
        if (this.screenOffset.x > gameSettings.width-width) {
            rect(
                gameSettings.width - this.screenOffset.x, 0, 
                width, height
            )
        }
        //top
        if (this.screenOffset.y < 0) {
            rect(
                0, 0, 
                width, -this.screenOffset.y
            )
        }
        //bottom
        if (this.screenOffset.y > gameSettings.height-height) {
            rect(
                0, gameSettings.height - this.screenOffset.y, 
                width, height
            )
        }
        pop();
    },

    //draws pickup-able objects
    drawPickups: function (gameState) {
        push();

        stroke(Animation.getColor());
        fill(gameSettings.colors.white);
        strokeWeight(4);
        for (let id in gameState.pickups) {
            let pickup = gameState.pickups[id];
            if (pickup.x-this.screenOffset.x > -50 &&
                pickup.x-this.screenOffset.x < width + 50 &&
                pickup.y-this.screenOffset.y > -50 &&
                pickup.y-this.screenOffset.y < height + 50) {
                    //draw circle
                    circle(
                        pickup.x-this.screenOffset.x,
                        pickup.y-this.screenOffset.y,
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
                            pickup.x-this.screenOffset.x,
                            pickup.y-this.screenOffset.y,
                            gameSettings.pickupRadius,
                            6
                        )
                        rect(
                            pickup.x-this.screenOffset.x,
                            pickup.y-this.screenOffset.y,
                            6,
                            gameSettings.pickupRadius
                        )
                        pop();
                    }

                    else if (pickup.type == 'life') {
                        push();
                        fill(Animation.getColor());
                        strokeWeight(4);
                        stroke(gameSettings.colors.black);
                        textAlign(CENTER, CENTER);
                        textSize(30);
                        text(
                            '+1', 
                            pickup.x-this.screenOffset.x, 
                            pickup.y-this.screenOffset.y - 3
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
            if (shot.x-this.screenOffset.x > 0 &&
                shot.x-this.screenOffset.x < width &&
                shot.y-this.screenOffset.y > 0 &&
                shot.y-this.screenOffset.y < height) {
                    fill(gameSettings.enemyTypes[shot.type].colors.dark);
                    stroke(gameSettings.enemyTypes[shot.type].colors.light);
                    circle(
                        shot.x-this.screenOffset.x, 
                        shot.y-this.screenOffset.y, 
                        10,
                    );
            }
        }

        //draw boss shots
        for (let id in gameState.shots.bossShots) {
            let shot = gameState.shots.bossShots[id];
            if (shot.x-this.screenOffset.x > 0 &&
                shot.x-this.screenOffset.x < width &&
                shot.y-this.screenOffset.y > 0 &&
                shot.y-this.screenOffset.y < height) {
                    fill(gameSettings.boss.colors.light);
                    stroke(gameSettings.boss.colors.dark);
                    circle(
                        shot.x-this.screenOffset.x, 
                        shot.y-this.screenOffset.y, 
                        10,
                    );
            }
        }
        
        //draw player shots
        for (let id in gameState.shots.playerShots) {
            let shot = gameState.shots.playerShots[id];
            if (shot.x-this.screenOffset.x > 0 &&
                shot.x-this.screenOffset.x < width &&
                shot.y-this.screenOffset.y > 0 &&
                shot.y-this.screenOffset.y < height) {
                    fill(gameSettings.playerTypes[shot.type].colors.light);
                    stroke(gameSettings.playerTypes[shot.type].colors.dark);
                    circle(
                        shot.x-this.screenOffset.x, 
                        shot.y-this.screenOffset.y, 
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
            if (enemy.x-this.screenOffset.x > -50 &&
                enemy.x-this.screenOffset.x < width + 50 &&
                enemy.y-this.screenOffset.y > -50 &&
                enemy.y-this.screenOffset.y < height + 50) {

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
                            -spineX + enemy.x - this.screenOffset.x, 
                            -spineY + enemy.y - this.screenOffset.y, 
                            spineX + enemy.x - this.screenOffset.x, 
                            spineY + enemy.y - this.screenOffset.y
                        );
                    }

                    //draw circle
                    circle(
                        enemy.x-this.screenOffset.x,
                        enemy.y-this.screenOffset.y,
                        gameSettings.enemyTypes[enemy.type].radius*2,
                    );
            }   
        }

        //draw healthbars
        for (let id in gameState.enemies) {
            let enemy = gameState.enemies[id];
            if (enemy.x-this.screenOffset.x > -50 &&
                enemy.x-this.screenOffset.x < width + 50 &&
                enemy.y-this.screenOffset.y > -50 &&
                enemy.y-this.screenOffset.y < height + 50) {

                    let x_offset = 15
                    let y_offset_abs = gameSettings.enemyTypes[enemy.type].radius + 10;
                    let y_offset = y_offset_abs;
                    if (enemy.y-this.screenOffset.y > height - 50) {
                        y_offset = -y_offset_abs;
                    }
                    stroke(gameSettings.enemyTypes[enemy.type].colors.dark);
                    strokeWeight(2);
                    fill('black');
                    rect(
                        enemy.x - x_offset-this.screenOffset.x, 
                        enemy.y + y_offset-this.screenOffset.y, 
                        x_offset*2, 
                        5*(y_offset/y_offset_abs),
                    );
                    strokeWeight(0);
                    fill(gameSettings.enemyTypes[enemy.type].colors.light);
                    rect(
                        enemy.x - x_offset-this.screenOffset.x, 
                        enemy.y + y_offset-this.screenOffset.y, 
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
            if (boss.x-this.screenOffset.x > -200 &&
                boss.x-this.screenOffset.x < width + 200 &&
                boss.y-this.screenOffset.y > -200 &&
                boss.y-this.screenOffset.y < height + 200) {

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
                            -spineX + boss.x - this.screenOffset.x, 
                            -spineY + boss.y - this.screenOffset.y, 
                            spineX + boss.x - this.screenOffset.x, 
                            spineY + boss.y - this.screenOffset.y
                        );
                    }

                    //draw circle
                    circle(
                        boss.x - this.screenOffset.x,
                        boss.y - this.screenOffset.y,
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
                zone.x - this.screenOffset.x, 
                zone.y - this.screenOffset.y, 
                zone.radius*2
            );
        }

        pop();
    },

    //draw living players
    drawLiving: function (gameState) {

        push();

        //draw players
        for (let id in gameState.players.playing) {
            if (id != socket.id) {
                let player = gameState.players.playing[id];
                if (player.health > 0 &&
                    player.x-this.screenOffset.x > -50 &&
                    player.x-this.screenOffset.x < width + 50 &&
                    player.y-this.screenOffset.y > -50 &&
                    player.y-this.screenOffset.y < height + 50) {
                        
                        fill(gameSettings.playerTypes[player.type].colors.light);
                        stroke(gameSettings.playerTypes[player.type].colors.dark);
                        strokeWeight(4);
                        circle(
                            player.x-this.screenOffset.x, 
                            player.y-this.screenOffset.y, 
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
                    player.x-this.screenOffset.x > -50 &&
                    player.x-this.screenOffset.x < width + 50 &&
                    player.y-this.screenOffset.y > -50 &&
                    player.y-this.screenOffset.y < height + 50) {
                        let x_offset = 15
                        let y_offset_abs = gameSettings.playerTypes[player.type].radius + 10;
                        let y_offset = y_offset_abs;
                        // if (player.y-this.screenOffset.y > height - 50) {
                        //     y_offset = -y_offset_abs;
                        // }
                        stroke(gameSettings.playerTypes[player.type].colors.dark);
                        strokeWeight(2);
                        fill('black');
                        rect(
                            player.x - x_offset-this.screenOffset.x, 
                            player.y + y_offset-this.screenOffset.y, 
                            x_offset*2, 
                            5*(y_offset/y_offset_abs),
                        );
                        strokeWeight(0);
                        fill(gameSettings.playerTypes[player.type].colors.light);
                        rect(
                            player.x - x_offset-this.screenOffset.x, 
                            player.y + y_offset-this.screenOffset.y, 
                            x_offset*2*(player.health/gameSettings.playerTypes[player.type].maxHealth), 
                            5*(y_offset/y_offset_abs),
                        );
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
                player.x-this.screenOffset.x, 
                player.y-this.screenOffset.y, 
                gameSettings.playerTypes[player.type].radius*2 - 1, 
            );
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
                player.x-this.screenOffset.x, 
                player.y-this.screenOffset.y, 
                gameSettings.playerTypes[player.type].radius*2 - 1, 
            );
        }

        pop();
    },

    drawAbilities: function (gameState) {
        push();

        //loop through abilities
        for (let id in gameState.abilities) {
            let ability = gameState.abilities[id];

            //switch on ability type
            switch (ability.type) {

                case "turret":
                    break;
                
                case "freeze":
                    let fillcolor = color(gameSettings.colors.blue);
                    fillcolor.setAlpha(100);
                    fill(fillcolor);
                    stroke(Animation.getColor());
                    strokeWeight(4);

                    circle(
                        ability.x - this.screenOffset.x,
                        ability.y - this.screenOffset.y,
                        gameSettings.abilityTypes[ability.type].radius*2 - 1,
                    );

                    break;

                case "fullauto":
                    //find ability user
                    if (ability.playerId in gameState.players.playing) {
                        let player = gameState.players.playing[ability.playerId];

                        //draw crosshair around that player
                        fill(0,0);
                        stroke(Animation.getColor());
                        strokeWeight(4);
                        circle(
                            player.x-this.screenOffset.x, 
                            player.y-this.screenOffset.y, 
                            gameSettings.playerTypes[player.type].radius*2.5 - 1, 
                        );
                        //horizontal line
                        line(
                            player.x-this.screenOffset.x + gameSettings.playerTypes[player.type].radius,
                            player.y-this.screenOffset.y,
                            player.x-this.screenOffset.x - gameSettings.playerTypes[player.type].radius,
                            player.y-this.screenOffset.y,
                        )
                        //vertical line
                        line(
                            player.x-this.screenOffset.x,
                            player.y-this.screenOffset.y + gameSettings.playerTypes[player.type].radius,
                            player.x-this.screenOffset.x,
                            player.y-this.screenOffset.y - gameSettings.playerTypes[player.type].radius,
                        )
                    }
                    break;

                case "shield":
                    //find ability user
                    if (ability.playerId in gameState.players.playing) {
                        let player = gameState.players.playing[ability.playerId];

                        //draw double circle around that player to indicate shield
                        fill(0,0);
                        stroke(Animation.getColor());
                        strokeWeight(4);
                        circle(
                            player.x-this.screenOffset.x, 
                            player.y-this.screenOffset.y, 
                            gameSettings.playerTypes[player.type].radius*2.5 - 1, 
                        );

                        circle(
                            player.x-this.screenOffset.x, 
                            player.y-this.screenOffset.y, 
                            gameSettings.playerTypes[player.type].radius*3 - 1, 
                        );
                    }
                    break;
            }
        }

        pop();
    },

    drawNames: function (gameState) {
        push();

        //draw names
        strokeWeight(4);
        textAlign(CENTER, BOTTOM);
        textSize(22);
        for (let id in gameState.players.playing) {
            let player = gameState.players.playing[id];
            if (player.health > 0 &&
                player.x-this.screenOffset.x > -50 &&
                player.x-this.screenOffset.x < width + 50 &&
                player.y-this.screenOffset.y > -50 &&
                player.y-this.screenOffset.y < height + 50) {

                    let y_offset_abs = gameSettings.playerTypes[player.type].radius + 10;
                    let y_offset = -y_offset_abs;
                    
                    fill(gameSettings.playerTypes[player.type].colors.light);
                    stroke(gameSettings.playerTypes[player.type].colors.dark);

                    text(
                        player.name, 
                        player.x-this.screenOffset.x,
                        player.y-this.screenOffset.y+y_offset,
                    )
            }
        }

        pop();
    }
}