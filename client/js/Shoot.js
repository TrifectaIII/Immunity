//tracks player shooting inputs
var Shoot = {

    //keep track of clicking
    clicking: false,

    //track previously sent clicking state
    previous: false,

    sendClicking: function (socket) {
        if (this.clicking != this.previous) {
            socket.emit('click', this.clicking);
            this.previous = this.clicking;
        }
    }
}

//clicking when mousedown
document.addEventListener('mousedown', function () {
    Shoot.clicking = true;
});

//stop clicking when mouseup
document.addEventListener('mouseup', function () {
    Shoot.clicking = false;
});

//stop clicking when mouse leaves window
document.addEventListener('mouseleave', function () {
    Shoot.clicking = false;
});

//stop clicking when window loses focus
window.addEventListener('blur', function () {
    Shoot.clicking = false;
});