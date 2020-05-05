//holds setInterval for movement
var moveInterval;
//holds setInterval for clicking
var clickInterval;

//called by moveInterval 
function directionHandler (socket) {
    if (state == "game" &&
        socket.id in playingData && 
        playingData[socket.id].health > 0) {
            sendDirection(socket);
    }
}

//called by clickInterval 
function clickHandler (socket) {
    if (state == "game" &&
        socket.id in playingData && 
        playingData[socket.id].health > 0) {
            sendClicking(socket);
    }
}

// adds listeners for shooting
function startControls (socket) {

    //execute direction emits from movement.js
    clearInterval(moveInterval);
    moveInterval = setInterval(
        function () {directionHandler(socket)},
        //uses half of games tickRate
        gameSettings.tickRate/2 
    );

    //execute click emits from shoot.js
    clearInterval(clickInterval);
    clickInterval = setInterval(
        function () {clickHandler(socket)},
        //uses half of games tickRate
        gameSettings.tickRate/2 
    );

    //recieve and respond to shoot requests
    socket.on('shoot_request', function () {
        socket.emit(
            'shoot',
            mouseX+screenOffset.x,
            mouseY+screenOffset.y
        );
    });
}