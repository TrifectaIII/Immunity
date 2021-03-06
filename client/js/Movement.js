// tracks player movement inputs
var Movement = {

    //variables to track pressing
    right: false,
    left: false,
    up: false,
    down: false,

    //current angle
    angle: 'none',

    //move based on currently pressed keys
    //NOTE: this is called in a setInterval in Control.js
    sendAngle: function (socket) {

        let newAngle = 'none';

        if (this.right && !this.left && this.up && !this.down) {
            newAngle = Math.PI*(7/4);
        }
        else if (!this.right && this.left && this.up && !this.down) {
            newAngle = Math.PI*(5/4);
        }
        else if (this.right && !this.left && !this.up && this.down) {
            newAngle = Math.PI*(1/4);
        }
        else if (!this.right && this.left && !this.up && this.down) {
            newAngle = Math.PI*(3/4);
        }
        else if (this.right && !this.left) {
            newAngle = 0;
        }
        else if (!this.right && this.left) {
            newAngle = Math.PI;
        }
        else if (this.up && !this.down) {
            newAngle = Math.PI*(3/2);
        }
        else if (!this.up && this.down) {
            newAngle = Math.PI*(1/2);
        }

        //if any change, send to server
        if (newAngle != this.angle) {
            socket.emit('angle', newAngle);
            //update current angle to new angle
            this.angle = newAngle;
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