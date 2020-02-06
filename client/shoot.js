function start_shoot () {
    var canvas = document.querySelector('canvas');

    canvas.addEventListener('click', function (event) {
        event.preventDefault();
        if (socket.id in players) {
            let player = players[socket.id];
            let vel = velocity(player.x, player.y, mouseX, mouseY)
            socket.emit('shoot', vel);
        }
        
    })
}

//calculates component velocities of shot based on velocity and destination coordinates
function velocity(x, y, dest_x, dest_y) {
    var angle = Math.atan2(dest_x - x, dest_y - y);
    return {x:Math.sin(angle) * game.shot_speed,
            y:Math.cos(angle) * game.shot_speed,
    };
}