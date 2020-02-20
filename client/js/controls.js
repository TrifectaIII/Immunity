var moveInterval;

// adds listeners for shooting
function startControls (canvas) {

    //execute direction emits from movement.js
    clearInterval(moveInterval);
    moveInterval = setInterval(
        function () {
            if (state == "game" && 
                socket.id in playerData && 
                playerData[socket.id].health > 0) {
                    sendDirection();
            }
        },
        gameSettings.tickRate/2 //uses half of games tickRate
    );

    //shoot on click
    canvas.elt.addEventListener('click', function (event) {
        event.preventDefault();
        if (state == "game" && 
            socket.id in playerData && 
            playerData[socket.id].health > 0) {
                socket.emit(
                    'shoot', 
                    mouseX+screenOffset.x, mouseY+screenOffset.y //x and y of mouse in game world
                );
        }
    });

    //pickup on e
    document.addEventListener('keypress', function (event) {
        if (event.keyCode == 69 || event.keyCode == 101) {//e key
            if (state == "game" && 
                socket.id in playerData &&
                playerData[socket.id].health > 0) {
                    socket.emit('pickup');
            }
        }
    });
}