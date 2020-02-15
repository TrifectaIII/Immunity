// adds listeners for shooting
function startControls () {

    //execute move emits from movement.js
    setInterval(function () {
        if (state == "game" && 
            socket.id in players && 
            players[socket.id].health > 0) {
                sendMove();
        }
    },game.tickRate);//use games tickRate

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

    //full spread on space and pickup on e
    document.addEventListener('keypress', function (event) {

        //full spread
        if (event.keyCode == 32) {//space key
            event.preventDefault();
            if (state == "game" && 
                socket.id in players &&
                players[socket.id].health > 0) {
                    socket.emit(
                        'full_spread', 
                        mouseX+screenOffset.x, mouseY+screenOffset.y //x and y of mouse in game world
                    );
            }
        }

        //pickup
        if (event.keyCode == 69 || event.keyCode == 101) {//e key
            if (state == "game" && 
                socket.id in players &&
                players[socket.id].health > 0) {
                    socket.emit('pickup');
            }
        }
    });
}