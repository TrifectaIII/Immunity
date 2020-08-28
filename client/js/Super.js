// tracks player super activation
var Super = {

    //track pressing
    pressing: false,

    //track previous state
    wasPressing: false,

    //move based on currently pressed keys
    //NOTE: this is called in a setInterval in Control.js
    sendActivation: function (socket) {
        //if any change, send to server
        if (this.pressing && !this.wasPressing) {
            socket.emit('super');
            this.wasPressing = true;
        }
        else if (!pressing) {
            this.wasPressing = false;
        }
    },
}

//track key downs
document.addEventListener('keydown', function (event) {
    if (event.keyCode === 69) {
        Super.pressing = true;
    }
});

//track key ups
document.addEventListener('keyup', function (event) {
    if (event.keyCode === 69) {
        Super.pressing = false;
    }
});

//remove all keys when window loses focus
window.addEventListener('blur', function () {
    Super.pressing = false;
});