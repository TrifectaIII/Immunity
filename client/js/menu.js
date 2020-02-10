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

    for (let x = (windowWidth%100)/2; x < windowWidth; x+=100) {
        line(
            x, 0,
            x, windowHeight
        );
    }
    for (let y = (windowHeight%100)/2; y < windowHeight; y+=100) {
        line(
            0, y,
            windowWidth, y
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

var createGameButton;
var joinButton;

function drawServerMenu () {

    if (!createGameButton) {
        createGameButton = new Button(
            "New Game", 
            windowWidth/2, windowHeight/4, 
            250, 100, 
            '#1D2B53', '#29ADFF'
        );
    }
    createGameButton.x = windowWidth/2;
    createGameButton.y = windowHeight/4;

    if(!joinButton) {
        joinButton = new Button(
            "Join",
            windowWidth/2, windowHeight*5/6,
            150, 100,
            '#008751', '#00E436'
        );
    }
    joinButton.x = windowWidth/2;
    joinButton.y = windowHeight*5/6;

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
    text("- OR -", windowWidth/2, windowHeight*17/40);
    text("Enter Game Code:", windowWidth/2, windowHeight*16/30);

    //draw create game button
    joinButton.draw();

    drawMenuCrosshair();

    //display input for game code
    codeInput.position(
        codeInput.canv.position().x + windowWidth/2 - codeInput.size().width/2,
        codeInput.canv.position().y + windowHeight*2/3 - codeInput.size().height/2
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

// Name Menu
///////////////////////////////////////

//input element to type in game code
var nameInput;

function setupNameInput (canv) {
    nameInput = createElement('input');
    nameInput.canv = canv;
    nameInput.elt.maxlength = 6;
    nameInput.hide();
    nameInput.size(300,75);
    nameInput.class('gameInput');
}

//gets value of codeInput 
function getNameInput () {
    return nameInput.elt.value.trim();
}

function hideNameInput () {
    nameInput.hide();
}

var setNameButton;

function drawNameMenu () {

    if (!setNameButton) {
        setNameButton = new Button(
            "SUBMIT", 
            windowWidth/2, windowHeight*2/3, 
            250, 100, 
            '#AB5236', '#FFEC27'
        );
    }
    setNameButton.x = windowWidth/2;
    setNameButton.y = windowHeight*2/3;

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
    text("Enter Name:", windowWidth/2, windowHeight/3);

    drawMenuCrosshair();

    //display input for game code
    nameInput.position(
        nameInput.canv.position().x + windowWidth/2 - nameInput.size().width/2,
        nameInput.canv.position().y + windowHeight/2 - nameInput.size().height/2
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
    text("Loading...", windowWidth/2, windowHeight/2);

    loadingProg -= 0.1;
    stroke(loadingColors[Math.floor(-(loadingProg/loadingColors.length)%loadingColors.length)]);
    strokeWeight(10);
    let spokes = 3;
    let spokeLength = 25;
    for (let i=1; i<=spokes; i++) {
        line(
            windowWidth/2 - Math.sin(loadingProg+(Math.PI/spokes)*i) * spokeLength, 
            windowHeight/3*2 - Math.cos(loadingProg+(Math.PI/spokes)*i) * spokeLength,
            windowWidth/2 + Math.sin(loadingProg+(Math.PI/spokes)*i) * spokeLength,
            windowHeight/3*2 + Math.cos(loadingProg+(Math.PI/spokes)*i) * spokeLength,
        );
    }
    
    drawMenuCrosshair();

    pop();
}