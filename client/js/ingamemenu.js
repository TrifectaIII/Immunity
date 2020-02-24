//Exit Game Button
//////////////////////////////////////////////////////////////////////////////

//button to exit the game entirely
var exitGameButton = new Button(
    "EXIT\nGAME",
    gameSettings.colors.darkpink,
    gameSettings.colors.pink
);

function drawExitGameButton() {
    exitGameButton.update(
        windowWidth - 100, 
        windowHeight - 100, 
        windowHeight/8, 
        windowHeight/8
    );
    exitGameButton.draw();
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
    strokeWeight(3);
    fill(gameSettings.colors.white);
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

// In Game Menu State Machine
//////////////////////////////////////////////////////////////////////////////

var inGameMenuState;

//draw in game menus
function drawInGameMenus () {

    //darken game screen
    background(0, 200);

    switch (inGameMenuState) {
        case 'class':
            drawClassMenu();
            break;
    }

    drawExitGameButton();

    drawMenuCrosshair();
}

function inGameMenuMouseClicked (socket) {
    if(exitGameButton.mouseOver()) {
        errors.displayError('Left Game', 5000);
        restartMenus();
        socket.close();
        return;
    }

    switch (inGameMenuState) {
        case 'class':
            if (clickClassMenu()) {
                socket.emit('class_choice', clickClassMenu());
            }
            break;
    }
}