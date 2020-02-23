//holds setInterval for movement
var moveInterval;
//holds setInterval for clicking
var clickInterval;

//called by moveInterval 
function directionHandler () {
    if (state == "game" && 
        socket.id in playerData && 
        playerData[socket.id].health > 0) {
            sendDirection();
    }
}

//called by clickInterval 
function clickHandler () {
    if (state == "game" && 
        socket.id in playerData && 
        playerData[socket.id].health > 0) {
            sendClicking();
    }
}
//called by click event
function shootHandler (event) {
    event.preventDefault();
        if (state == "game" && 
            socket.id in playerData && 
            playerData[socket.id].health > 0) {
                socket.emit(
                    'shoot', 
                    mouseX+screenOffset.x, mouseY+screenOffset.y //x and y of mouse in game world
                );
        }
}

// adds listeners for shooting
function startControls (canvas) {

    //execute direction emits from movement.js
    clearInterval(moveInterval);
    moveInterval = setInterval(
        //uses half of games tickRate
        directionHandler, gameSettings.tickRate/2 
    );

    //execute click emits from shoot.js
    clearInterval(clickInterval);
    clickInterval = setInterval(
        //uses half of games tickRate
        clickHandler, gameSettings.tickRate/2 
    );

    //shoot on click
    canvas.elt.removeEventListener('click', shootHandler);
    canvas.elt.addEventListener('click', shootHandler);

}