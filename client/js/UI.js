//code for drawing game ui
var UI = {

    // drawUI: function ()

    //draw a progress bar
    drawBar: function (options) {

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
    },

    //draw client player healthbar
    drawHealthBar: function (player) {

        UI.drawBar({
            x: windowWidth*3/8 - 10,
            y: windowHeight - 40,
            width: windowWidth/4,
            height: 40,
            color: gameSettings.playerTypes[player.type].colors.light,
            prog: player.health/gameSettings.playerTypes[player.type].maxHealth,
            leftText: 'Health',
            rightText: player.health.toString()+' / '+ gameSettings.playerTypes[player.type].maxHealth.toString(),
        })
    },

    //draw client player ability progress bar
    drawAbilityBar: function (player) {
        let color = gameSettings.colors.red;
        if (player.abilityProgress == gameSettings.abilityCap){
            color = gameSettings.colors.mango;
        }
        UI.drawBar({
            x: windowWidth*5/8 + 10,
            y: windowHeight - 40,
            width: windowWidth/4,
            height: 40,
            color: color,
            prog: player.abilityProgress/gameSettings.abilityCap,
            leftText: 'Ability',
            rightText: player.abilityProgress.toString()+' / '+ gameSettings.abilityCap.toString(),
        })
    },

    //draw boss's healthbar
    drawBossBar: function () {
        //only draw in boss exists
        if (Object.keys(gameState.bosses).length > 0) {
            let boss = gameState.bosses[Object.keys(gameState.bosses)[0]];
            UI.drawBar({
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
    },

    //draws minimap, player argument optional
    drawMiniMap: function (player) {

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
    },

    //display room code + info so others can join
    drawRoomInfo: function (color) {
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
    },

    //draw name, killstreak, and healthbar for each player
    drawPlayerInfo: function () {
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
    },

    //draw countdown to next wave
    drawWaveCountdown: function () {

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
    },

    fpsList: [],

    //draw framerate
    drawFPSandPing: function (color) {
        //add fps to list
        UI.fpsList.push(frameRate());
        //remove oldest if above 0.5 seconds
        if (UI.fpsList.length > 500/gameSettings.tickRate) {
            UI.fpsList.shift();
        }

        //round and average the list
        let fpsSum = UI.fpsList.reduce((a,b) => a+b);
        let fpsMean = (fpsSum/UI.fpsList.length);
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
    },

    //draw cosshair
    drawCrosshair: function (color) {
        push();
        stroke(color);
        strokeWeight(2);
        fill(0,0);
        circle(mouseX, mouseY, 30);
        line(mouseX+20, mouseY, mouseX-20, mouseY);
        line(mouseX, mouseY+20, mouseX, mouseY-20);
        pop();
    },
}




