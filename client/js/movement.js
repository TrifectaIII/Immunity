// Movement keys

//variables to track pressing
var right = false;
var left = false;
var up = false;
var down = false;

var direction = 'none';

//executes func after 100ms
// x = setTimeout(func, 100);

//executes func every 100ms
// y = setInterval(func, 100);

//stops a timeout from executing
// clearTimeout(x);

//stops an interval from continuing to execute
// clearInterval(y);

//track key downs
document.addEventListener('keydown', function (event) {
    switch (event.keyCode) {
        case 68: // D
            right = true;
            break;
        case 65: // A
            left = true;
            break;
        case 87: // W
            up = true;
            break;
        case 83: // S
            down = true;
            break;
    }
});

//track key ups
document.addEventListener('keyup', function (event) {
    switch (event.keyCode) {
        case 68: // D
            right = false;
            break;
        case 65: // A
            left = false;
            break;
        case 87: // W
            up = false;
            break;
        case 83: // S
            down = false;
            break;
    }
});

//remove all movements when window loses focus
window.addEventListener('blur', function () {
    right = false;
    left = false;
    up = false;
    down = false;
});

//move based on currently pressed keys

//NOTE: this is called in a setInterval in controls.js
function sendDirection () {

    let newDirection = 'none';

    if (right && !left && up && !down) {
        newDirection = ('rightup');
    }
    else if (!right && left && up && !down) {
        newDirection = ('leftup');
    }
    else if (right && !left && !up && down) {
        newDirection = ('rightdown');
    }
    else if (!right && left && !up && down) {
        newDirection = ('leftdown');
    }
    else if (right && !left) {
        newDirection = ('right');
    }
    else if (!right && left) {
        newDirection = ('left');
    }
    else if (up && !down) {
        newDirection = ('up');
    }
    else if (!up && down) {
        newDirection = ('down');
    }

    //if any change, send to server
    if (newDirection != direction) {
        socket.emit('direction', newDirection);
        direction = newDirection;
    }
}