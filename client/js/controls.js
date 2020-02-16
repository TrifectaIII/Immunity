var moveInterval;

// adds listeners for shooting
function startControls () {

    //execute move emits from movement.js
    clearInterval(moveInterval);
    moveInterval = setInterval(function () {
        if (state == "game" && 
            socket.id in players && 
            players[socket.id].health > 0) {
                sendMove();
        }
    }, gameSettings.tickRate);//use games tickRate

    //shoot on click
    canv.elt.addEventListener('click', function (event) {
        event.preventDefault();
        if (state == "game" && 
            socket.id in players && 
            players[socket.id].health > 0) {
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
                socket.id in players &&
                players[socket.id].health > 0) {
                    socket.emit('pickup');
            }
        }
    });
}