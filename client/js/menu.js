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
function Button (text, colorOff, colorOn) {
    this.text = text;
    this.colorOn = colorOn;
    this.colorOff = colorOff;
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
}

Button.prototype.update = function (x,y,width,height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

//checks if mouse is over the button
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

// Loading Screen
//////////////////////////////////////////////////////////////////////////////

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

// SERVER MENU
//////////////////////////////////////////////////////////////////////////////

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

var createGameButton = new Button( "New Game", '#1D2B53', '#29ADFF');
var joinButton = new Button( "Join", '#008751', '#00E436');

function drawServerMenu () {
    push();
    textAlign(CENTER, CENTER);

    //refresh screen
    clear();

    //draw background
    drawMenuGrid();

    //update and draw buttons
    createGameButton.update(windowWidth/2, windowHeight/4, 250, 100);
    joinButton.update(windowWidth/2, windowHeight*5/6, 150, 100);

    createGameButton.draw();
    joinButton.draw();

    //draw text for code entry
    stroke('black');
    strokeWeight(2);
    fill('black');
    textSize(40);
    text("- OR -", windowWidth/2, windowHeight*17/40);
    text("Enter Game Code:", windowWidth/2, windowHeight*16/30);

    //draw the crosshair
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
    return false;
}

// NAME MENU
//////////////////////////////////////////////////////////////////////////////

//input element to type in name
var nameInput;

function setupNameInput (canv) {
    nameInput = createElement('input');
    nameInput.canv = canv;
    nameInput.elt.maxLength = 6;
    nameInput.hide();
    nameInput.size(300,75);
    nameInput.class('gameInput');
}

//gets value of nameInput 
function getNameInput () {
    return nameInput.elt.value.trim();
}

function hideNameInput () {
    nameInput.hide();
}

var setNameButton = new Button("SUBMIT", '#AB5236', '#FFEC27');

function drawNameMenu () {
    push();
    textAlign(CENTER, CENTER);

    //refresh screen
    clear();

    //draw background
    drawMenuGrid();

    //update and draw set name button
    setNameButton.update(windowWidth/2, windowHeight*2/3, 250, 100);
    setNameButton.draw();

    //draw text for code entry
    stroke('black');
    strokeWeight(2);
    fill('black');
    textSize(40);
    text("Enter Name:", windowWidth/2, windowHeight/3);

    drawMenuCrosshair();

    //display input for name entry
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

// CLASS MENU
//////////////////////////////////////////////////////////////////////////////

var classButtons = {};

for (let className in gameSettings.classes) {
    classButtons[className] = new Button(
        className.toUpperCase(),
        gameSettings.classes[className].colors.dark,
        gameSettings.classes[className].colors.light
    )
}

var classCount = Object.keys(classButtons).length;

function drawClassMenu () {
    push();
    textAlign(CENTER, CENTER);

    //refresh screen
    clear();

    //draw background
    drawMenuGrid();

    //update and draw buttons
    let counter = 1;
    for (let className in classButtons) {
        let button = classButtons[className];
        button.update(
            windowWidth/2, 
            windowHeight*counter/(1+classCount), 
            windowWidth/2,
            windowHeight/(4+classCount)
        );
        button.draw();
        counter++;
    }

    //draw text for code entry
    stroke('black');
    strokeWeight(2);
    fill('black');
    textSize(40);
    text("Choose a Class:", windowWidth/2, windowHeight/12);

    drawMenuCrosshair();
}

function clickClassMenu () {
    for (let className in classButtons) {
        if (classButtons[className].mouseOver()) {
            return className;
        }
    }
    return false;
}