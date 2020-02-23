//variable to keep track of clicking
var clicking = false;

//tracks previously send clicking
var oldClicking = false;

//clicking when mousedown
document.addEventListener('mousedown', function () {
    clicking = true;
});

//stop clicking when mouseup
document.addEventListener('mouseup', function () {
    clicking = false;
});

//stop clicking when mouse leaves window
document.addEventListener('mouseleave', function () {
    clicking = false;
});

//stop clicking when window loses focus
window.addEventListener('blur', function () {
    clicking = false;
});

function sendClicking (socket) {
    if (clicking != oldClicking) {
        socket.emit('click', clicking);
        oldClicking = clicking;
    }
}