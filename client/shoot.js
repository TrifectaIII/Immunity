// adds listeners for shooting
function start_shoot (canvas_element) {

    //shoot on click
    canvas_element.addEventListener('click', function (event) {
        event.preventDefault();
        if (state == "game" && 
            socket.id in players && 
            players[socket.id].health > 0) {
                let player = players[socket.id];
                let vel = velocity(angle(player.x, player.y, mouseX+screen_offset.x, mouseY+screen_offset.y));
                socket.emit('shoot', vel);
        }
    });

    document.addEventListener('keypress', function (event) {
        if (event.keyCode == 32) {//space key
            event.preventDefault();
            if (state == "game" && 
                socket.id in players &&
                players[socket.id].health > 0) {
                    let player = players[socket.id];
                    let vels = [];
                    for (let i = 0; i < game.fullSpreadCount; i++) {
                        let vel = velocity(
                            angle(
                                player.x, player.y, 
                                mouseX+screen_offset.x, mouseY+screen_offset.y
                            ) 
                            + (i - game.fullSpreadCount/2 + 0.5) * game.fullSpreadAngle
                        );
                        vels.push(vel);
                    }
                    socket.emit('full_spread', vels);
            }
        }
    });
}

//calculates angle of vector between player position and shot destination
function angle(x, y, dest_x, dest_y) {
    return Math.atan2(dest_x - x, dest_y - y);
}

//calculates component velocities of shot based on velocity and angle
function velocity(ang) {
    return {
        x:Math.sin(ang) * game.shotSpeed,
        y:Math.cos(ang) * game.shotSpeed,
    };
}