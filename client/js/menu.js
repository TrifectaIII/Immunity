// draw cosshair for menu
function drawMenuCrosshair () {
    push();
    stroke("black");
    strokeWeight(2);
    fill(0,0);
    ellipse(mouseX, mouseY, 30, 30);
    line(mouseX+20, mouseY, mouseX-20, mouseY);
    line(mouseX, mouseY+20, mouseX, mouseY-20);
    pop();
}

//draw grid background for menus
function drawMenuGrid () {
    push();
    background('#FFF1E8');
    strokeWeight(1);
    stroke('#C2C3C7');
    for (let x = 100; x < game.screenWidth; x+=100) {
        line(
            x, 0,
            x, game.screenWidth
        );
    }
    for (let y = 100; y < game.screenHeight; y+=100) {
        line(
            0, y,
            game.screenHeight, y
        );
    }
    pop();
}

//button objects
function Button (text, x, y, width, height, colorOff, colorOn) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.colorOn = colorOn;
    this.colorOff = colorOff;
}

//checks if mouse os over the button
Button.prototype.mouseOver = function () {
    return (mouseX > this.x - this.width/2 &&
        mouseX < this.x + this.width/2 &&
        mouseY > this.y - this.height/2 &&
        mouseY < this.y + this.height/2);
}

//draws button
Button.prototype.draw = function () {
    push();
    textAlign(CENTER, CENTER);
    //draw box
    stroke('black');
    strokeWeight(4);
    fill(this.colorOff);
    if (this.mouseOver()) {
        fill(this.colorOn);
    }
    rect(this.x-this.width/2,this.y-this.height/2, this.width, this.height);

    //draw text
    stroke('black');
    strokeWeight(4);
    fill('#FFF1E8');
    textSize(40);
    text(this.text, this.x, this.y);
    pop();
}

// Server Menu
///////////////////////////////////////

var createGameButton = new Button(
    "New Game", 
    game.screenWidth/2, game.screenHeight/4, 
    250, 100, 
    '#1D2B53', '#29ADFF'
);

var joinButton = new Button(
    "Join",
    game.screenWidth/2, game.screenHeight*5/6,
    150, 100,
    '#008751', '#00E436'
)

//input element to type in game code
var codeInput;

function setupCodeInput (canv) {
    codeInput = createElement('input');
    codeInput.canv = canv;
    codeInput.hide();
    codeInput.size(200,75);
    codeInput.class('gameInput');
}

//gets value of codeInput 
function getCodeInput () {
    return codeInput.elt.value.trim();
}

function hideCodeInput () {
    codeInput.hide();
}

function drawServerMenu () {
    push();
    textAlign(CENTER, CENTER);

    //refresh screen
    clear();

    //draw background
    drawMenuGrid();

    //draw create game button
    createGameButton.draw();

    //draw text for code entry
    stroke('black');
    strokeWeight(2);
    fill('black');
    textSize(40);
    text("- OR -", game.screenWidth/2, game.screenHeight*17/40);
    text("Enter Game Code:", game.screenWidth/2, game.screenHeight*16/30);

    //draw create game button
    joinButton.draw();

    drawMenuCrosshair();

    //display input for game code
    codeInput.position(
        codeInput.canv.position().x + game.screenWidth/2 - codeInput.size().width/2 + 5, //need to offset by 5 for some reason
        codeInput.canv.position().y + game.screenHeight*2/3 - codeInput.size().height/2
    );
    codeInput.show();
    pop();
}

function clickServerMenu () {
    if (createGameButton.mouseOver()) {
        return "new game";
    }
    if (joinButton.mouseOver()) {
        return "join";
    }
}

// Server Menu
///////////////////////////////////////

var setNameButton = new Button(
    "SUBMIT", 
    game.screenWidth/2, game.screenHeight*2/3, 
    250, 100, 
    '#AB5236', '#FFEC27'
);

//input element to type in game code
var nameInput;

function setupNameInput (canv) {
    nameInput = createElement('input');
    nameInput.canv = canv;
    nameInput.hide();
    nameInput.size(400,75);
    nameInput.class('gameInput');
}

//gets value of codeInput 
function getNameInput () {
    return nameInput.elt.value.trim();
}

function hideNameInput () {
    nameInput.hide();
}

function drawNameMenu () {
    push();
    textAlign(CENTER, CENTER);

    //refresh screen
    clear();

    //draw background
    drawMenuGrid();

    //draw create game button
    setNameButton.draw();

    //draw text for code entry
    stroke('black');
    strokeWeight(2);
    fill('black');
    textSize(40);
    text("Enter Name:", game.screenWidth/2, game.screenHeight/3);

    drawMenuCrosshair();

    //display input for game code
    nameInput.position(
        nameInput.canv.position().x + game.screenWidth/2 - nameInput.size().width/2 + 5, //need to offset by 5 for some reason
        nameInput.canv.position().y + game.screenHeight/2 - nameInput.size().height/2
    );
    nameInput.show();
    pop();
}

function clickNameMenu () {
    return setNameButton.mouseOver();
}

// Loading Screen
///////////////////////////////////////

var loadingProg = 0;
var loadingColors = ['#29ADFF', '#FFEC27', '#FF77A8', '#00E436'];


function drawLoading () {
    push();
    textAlign(CENTER, CENTER);

    //refresh screen
    clear()

    //draw background
    drawMenuGrid();

    //draw text
    stroke('black');
    strokeWeight(2);
    fill('black');
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

    pop();
}