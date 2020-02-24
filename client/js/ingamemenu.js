
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

    drawMenuCrosshair();
}

function inGameMenuMouseClicked () {
    switch (inGameMenuState) {
        case 'class':
            if (clickClassMenu()) {
                socket.emit('class_choice', clickClassMenu());
            }
            break;
    }
}