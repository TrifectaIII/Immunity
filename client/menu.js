var loadingProg = 0;
var loadingColors = ['#29ADFF', '#FFEC27', '#FF77A8', '#00E436'];

// draw loading screen
function drawLoading () {
    //refresh screen
    clear()
    background('#FFF1E8');

    //draw text
    stroke('black');
    strokeWeight(3);
    fill('#29ADFF');
    textSize(40);
    text("Loading...", game.screenWidth/2, game.screenHeight/2);
    drawMenuCrosshair();

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
