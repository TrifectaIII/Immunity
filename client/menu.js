function drawServerMenu () {
    //refresh screen
    clear()
    background('#5F574F');

    //draw create game button
    stroke('black');
    strokeWeight(3);
    fill('#1D2B53');
    if (mouseX > game.screenWidth/5 &&
        mouseX < game.screenWidth*4/5 &&
        mouseY > game.screenHeight/4-50 &&
        mouseY < game.screenHeight/4+50) {
            fill('#29ADFF');
    }
    rect(
            game.screenWidth/5, game.screenHeight/4-50,
            game.screenWidth*3/5, 100
        )

    //draw text
    stroke('black');
    strokeWeight(3);
    fill('#FFF1E8');
    textSize(40);
    text("CREATE NEW GAME", game.screenWidth/2, game.screenHeight/4);
    text("OR", game.screenWidth/2, game.screenHeight/2);
    text("USE GAME CODE", game.screenWidth/2, game.screenHeight*2/3);

    drawMenuCrosshair();
}

var loadingProg = 0;
var loadingColors = ['#29ADFF', '#FFEC27', '#FF77A8', '#00E436'];

// draw loading screen
function drawLoading () {
    //refresh screen
    clear()
    background('#5F574F');

    //draw text
    stroke('black');
    strokeWeight(3);
    fill('#29ADFF');
    textSize(40);
    text("Loading...", game.screenWidth/2, game.screenHeight/2);

    loadingProg -= 0.1;
    stroke(loadingColors[Math.floor(-(loadingProg/loadingColors.length)%loadingColors.length)]);
    strokeWeight(10);
    let spokes = 3;
    let spokeLength = 25;
    for (let i=1; i<=spokes; i++) {
        line(
            game.screenWidth/2 - Math.sin(loadingProg+(Math.PI/spokes)*i) * spokeLength, 
            game.screenHeight/3*2 - Math.cos(loadingProg+(Math.PI/spokes)*i) * spokeLength,
            game.screenWidth/2 + Math.sin(loadingProg+(Math.PI/spokes)*i) * spokeLength,
            game.screenHeight/3*2 + Math.cos(loadingProg+(Math.PI/spokes)*i) * spokeLength,
        );
    }
    
    drawMenuCrosshair();
}

// draw cosshair for menu
function drawMenuCrosshair () {
    stroke("black");
    strokeWeight(2);
    fill(0,0);
    ellipse(mouseX, mouseY, 30, 30);
    line(mouseX+20, mouseY, mouseX-20, mouseY);
    line(mouseX, mouseY+20, mouseX, mouseY-20);
}
