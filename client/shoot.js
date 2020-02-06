// adds listeners for shooting
function start_shoot () {
    var canvas = document.querySelector('canvas');

    //shoot on click
    canvas.addEventListener('click', function (event) {
        event.preventDefault();
        if (socket.id in players) {
            let player = players[socket.id];
            let vel = velocity(angle(player.x, player.y, mouseX, mouseY));
            socket.emit('shoot', vel);
        }
        
    });

    // full spread on space
    document.addEventListener('keypress', function (event) {
        if (event.keyCode == 32 && socket.id in players) {
            event.preventDefault();
            let player = players[socket.id];
            let vels = [];
            for (let i = -2; i <= 2; i++) {
                let vel = velocity(angle(player.x, player.y, mouseX, mouseY) + i * game.full_spread_angle);
                vels.push(vel);
            }
            socket.emit('full_spread', vels)
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
        x:Math.sin(ang) * game.shot_speed,
        y:Math.cos(ang) * game.shot_speed,
    };
}