// tracks player movement inputs
var Movement = {

    //variables to track pressing
    right: false,
    left: false,
    up: false,
    down: false,

    //current direction
    direction: 'none',

    //move based on currently pressed keys
    //NOTE: this is called in a setInterval in Controls.js
    sendDirection: function (socket) {

        let newDirection = 'none';

        if (Movement.right && !Movement.left && Movement.up && !Movement.down) {
            newDirection = 'rightup';
        }
        else if (!Movement.right && Movement.left && Movement.up && !Movement.down) {
            newDirection = 'leftup';
        }
        else if (Movement.right && !Movement.left && !Movement.up && Movement.down) {
            newDirection = 'rightdown';
        }
        else if (!Movement.right && Movement.left && !Movement.up && Movement.down) {
            newDirection = 'leftdown';
        }
        else if (Movement.right && !Movement.left) {
            newDirection = 'right';
        }
        else if (!Movement.right && Movement.left) {
            newDirection = 'left';
        }
        else if (Movement.up && !Movement.down) {
            newDirection = 'up';
        }
        else if (!Movement.up && Movement.down) {
            newDirection = 'down';
        }

        //if any change, send to server
        if (newDirection != Movement.direction) {
            socket.emit('direction', newDirection);
            //update current direction to new direction
            Movement.direction = newDirection;
        }
    },
}

//track key downs
document.addEventListener('keydown', function (event) {
    switch (event.keyCode) {
        case 68: // D
            Movement.right = true;
            break;
        case 65: // A
            Movement.left = true;
            break;
        case 87: // W
            Movement.up = true;
            break;
        case 83: // S
            Movement.down = true;
            break;
    }
});

//track key ups
document.addEventListener('keyup', function (event) {
    switch (event.keyCode) {
        case 68: // D
            Movement.right = false;
            break;
        case 65: // A
            Movement.left = false;
            break;
        case 87: // W
            Movement.up = false;
            break;
        case 83: // S
            Movement.down = false;
            break;
    }
});

//remove all keys when window loses focus
window.addEventListener('blur', function () {
    Movement.right = false;
    Movement.left = false;
    Movement.up = false;
    Movement.down = false;
});