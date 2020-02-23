// draw cosshair for menu
//////////////////////////////////////////////////////////////////////////////

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
//////////////////////////////////////////////////////////////////////////////

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

//Button Object Constructor
//////////////////////////////////////////////////////////////////////////////

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
    rect(
        this.x-this.width/2,
        this.y-this.height/2, 
        this.width, 
        this.height
    );

    //draw text
    stroke('black');
    strokeWeight(4);
    fill(gameSettings.colors.white);
    textSize(40);
    text(this.text, this.x, this.y);
    pop();
}

// TextInput Object Constructor
//////////////////////////////////////////////////////////////////////////////

function TextInput (canvas, maxLength) {
    this.element = createElement('input');
    //hide by default
    this.element.hide();
    this.canvas = canvas;
    this.element.elt.maxLength = maxLength;
    this.element.class('gameInput');
}

// returns value of the input
TextInput.prototype.getValue = function () {
    return this.element.elt.value.trim();
}

// hides input
TextInput.prototype.hide = function () {
    this.element.hide();
}

TextInput.prototype.clear = function () {
    this.element.elt.value = '';
}

//shows input at certain location and size
TextInput.prototype.showAt = function (x, y, w, h) {
    this.element.size(w,h);
    this.element.position(
        this.canvas.position().x + x - w/2,
        this.canvas.position().y + y - h/2
    )
    this.element.show();
}

//Back Button
//////////////////////////////////////////////////////////////////////////////

//button to go to previous menu
var backButton = new Button(
    "BACK",
    gameSettings.colors.darkpink,
    gameSettings.colors.pink
);

function drawBackButton() {
    backButton.update(
        100, 
        windowHeight - 100, 
        windowHeight/8, 
        windowHeight/8
    );
    backButton.draw();
}




// TITLE MENU
//////////////////////////////////////////////////////////////////////////////

var titleProg = 0;
var titleColors = [];

for (let type in gameSettings.classes) {
    titleColors.push(gameSettings.classes[type].colors.light);
}

var startButton = new Button(
    "START",
    gameSettings.colors.darkgreen,
    gameSettings.colors.green
);

function drawTitleMenu () {

    push();

    textAlign(CENTER, CENTER);

    //update and draw set name button
    startButton.update(
        windowWidth/2,
        windowHeight*2/3, 
        windowWidth/4, 
        windowHeight/8
    );
    startButton.draw();

    //draw title
    stroke('black');
    strokeWeight(8);
    titleProg -= 0.1;
    fill(titleColors[Math.floor(-(titleProg/titleColors.length)%titleColors.length)]);
    textSize(100);
    text(gameSettings.title.toUpperCase(), windowWidth/2, windowHeight/3);

    //draw credits
    strokeWeight(2);
    fill('black');
    textSize(40);
    text("WASD to Move\nClick to Shoot", windowWidth/2, windowHeight/2);

    pop();
}

function clickTitleMenu () {
    return startButton.mouseOver();
}


// NAME MENU
//////////////////////////////////////////////////////////////////////////////

//input element to type in name
var nameInput;

//button to submit name
var setNameButton = new Button(
    "SUBMIT", 
    gameSettings.colors.darkblue, 
    gameSettings.colors.blue
);

function drawNameMenu (canvas) {

    // set up nameInput if not setup yet
    if (nameInput == null) {
        nameInput = new TextInput(canvas, 6);
    }

    push();
    textAlign(CENTER, CENTER);

    //update and draw set name button
    setNameButton.update(
        windowWidth/2,
        windowHeight*2/3, 
        windowWidth/4, 
        windowHeight/8
    );
    setNameButton.draw();

    //draw text for name entry
    stroke('black');
    strokeWeight(2);
    fill('black');
    textSize(40);
    text("Enter Name:", windowWidth/2, windowHeight/3);

    //display input for name entry
    nameInput.showAt(
        windowWidth/2, 
        windowHeight/2, 
        windowWidth/3, 
        75
    );

    pop();
}

function clickNameMenu () {
    return setNameButton.mouseOver();
}

// SERVER MENU
//////////////////////////////////////////////////////////////////////////////

//input element to type in game code
var codeInput;

var createGameButton = new Button( 
    "NEW GAME", 
    gameSettings.colors.darkgreen, 
    gameSettings.colors.green
);

var joinButton = new Button( 
    "JOIN", 
    gameSettings.colors.darkblue, 
    gameSettings.colors.blue
);

function drawServerMenu (canvas) {

    //setup codeInput if not setup yet
    if (codeInput == null) {
        codeInput = new TextInput(canvas, 6);
    }

    push();
    textAlign(CENTER, CENTER);

    //update and draw buttons
    createGameButton.update(
        windowWidth/2, 
        windowHeight/4, 
        windowWidth/4, 
        windowHeight/8
    );
    joinButton.update(
        windowWidth/2, 
        windowHeight*5/6, 
        windowWidth/5, 
        windowHeight/8
    );

    createGameButton.draw();
    joinButton.draw();

    //draw text for code entry
    stroke('black');
    strokeWeight(2);
    fill('black');
    textSize(40);
    text("- OR -", windowWidth/2, windowHeight*17/40);
    text("Enter Game Code:", windowWidth/2, windowHeight*16/30);

    //display input for game code
    codeInput.showAt(
        windowWidth/2, 
        windowHeight*2/3,
        windowWidth/4,
        75
    );

    pop();
}

function clickServerMenu () {
    if (createGameButton.mouseOver()) {
        return "new_game";
    }
    if (joinButton.mouseOver()) {
        return "join";
    }
    return false;
}

// CLASS MENU
//////////////////////////////////////////////////////////////////////////////

var classButtons = {};

for (let className in gameSettings.classes) {
    classButtons[className] = new Button(
        className.toUpperCase(),
        gameSettings.classes[className].colors.dark,
        gameSettings.classes[className].colors.light
    );
}

var classCount = Object.keys(classButtons).length;

function drawClassMenu () {
    push();
    textAlign(CENTER, CENTER);

    
    //update and draw buttons
    let counter = 1;
    for (let className in classButtons) {
        let button = classButtons[className];
        button.update(
            windowWidth/2, 
            windowHeight*counter/(1+classCount), 
            windowWidth/3,
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
}

function clickClassMenu () {
    for (let className in classButtons) {
        if (classButtons[className].mouseOver()) {
            return className;
        }
    }
    return false;
}

// Loading Screen
//////////////////////////////////////////////////////////////////////////////

var loadingProg = 0;
var loadingColors = [];

for (let className in gameSettings.classes) {
    loadingColors.push(gameSettings.classes[className].colors.light);
}

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

// Menu State Machine
//////////////////////////////////////////////////////////////////////////////

var menuChoices = {
    name: '',
    roomId: '',
    className: '',
}

//list of menu progression (first to last)
const menuList = ['title', 'name', 'server', 'class'];

//tracks which menu we are on, starts at first
var menuIndex = 0;


//draws each menu
function drawMenus (canvas) {

    //refresh screen
    clear();

    //draw background
    drawMenuGrid();

    //draw contents of menu based on state
    switch (menuList[menuIndex]) {

        //draw title menu
        case 'title':
            drawTitleMenu();
            break;

        //draw name menu
        case 'name':
            drawNameMenu(canvas);
            break;

        //draw server menu
        case 'server':
            drawServerMenu(canvas);
            break;

        //draw class menu
        case 'class':
            drawClassMenu();
            break;
    }

    if (menuIndex > 0) {
        drawBackButton();
    }

    //draw mouse crosshair
    drawMenuCrosshair();
}

//checks for clicks when menu is active
function menuMouseClicked () {

    //go back 1 if button clicked
    if (backButton.mouseOver() && menuIndex > 0) {
        menuIndex-= 1;
        nameInput.hide();
        codeInput.hide();
        return;
    }

    //otherwise, menu specific
    switch (menuList[menuIndex]) {

        case 'title':
            if (clickTitleMenu()) {
                menuIndex += 1;
            }
            break;

        case 'name':
            if (clickNameMenu() && nameInput.getValue() != '') {
                menuChoices.name = nameInput.getValue();
                nameInput.hide();
                menuIndex += 1;
            }
            break;
        
        case 'server':
            switch (clickServerMenu()) {
                case 'new_game':
                    menuChoices.roomId = 'new_game';
                    codeInput.hide();
                    menuIndex += 1;
                    break;
                case 'join':
                    if (codeInput.getValue() != '') {
                        menuChoices.roomId = codeInput.getValue();
                        codeInput.hide();
                        menuIndex += 1;
                    }
                    break;
            }
            break;

        case 'class':
            if (clickClassMenu()) {
                //join game once class selected
                menuChoices.className = clickClassMenu();
                menuIndex += 1;
            }
            break;
    }

    //if at the end of menus, go to game
    if (menuIndex == menuList.length) {
        joinGame(menuChoices);
    }
}

//checks for key presses when menu is active
function menuKeyPressed (keyCode) {
    switch (menuList[menuIndex]) {

        case 'name':
            if (keyCode == ENTER) {
                if (nameInput.getValue() != '') {
                    menuChoices.name = nameInput.getValue();
                    nameInput.hide();
                    menuIndex += 1;
                }
                return false;
            }
            break;

        case 'server':
            if (keyCode == ENTER) {
                if (codeInput.getValue() != '') {
                    menuChoices.roomId = codeInput.getValue();
                    codeInput.hide();
                    menuIndex += 1;
                }
                return false;
            }
            break;
    }
}


//resets state to first menu
function restartMenus () {
    //change global state to menu
    state = 'menu';

    //remove game code input contents
    codeInput.clear();

    //set index to first menu in list
    menuIndex = 0;
}