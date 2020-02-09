// adds listeners for shooting
function start_shoot (canvas_element) {

    //shoot on click
    canvas_element.addEventListener('click', function (event) {
        event.preventDefault();
        if (state == "game" && 
            socket.id in players && 
            players[socket.id].health > 0) {
                socket.emit(
                    'shoot', 
                    mouseX+screen_offset.x, mouseY+screen_offset.y //x and y of mouse
                );
        }
    });

    document.addEventListener('keypress', function (event) {
        if (event.keyCode == 32) {//space key
            event.preventDefault();
            if (state == "game" && 
                socket.id in players &&
                players[socket.id].health > 0) {
                    socket.emit(
                        'full_spread', 
                        mouseX+screen_offset.x, mouseY+screen_offset.y //x and y of mouse
                    );
            }
        }
    });
}