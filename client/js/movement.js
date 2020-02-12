// Movement keys

//variables to track pressing
var right = false;
var left = false;
var up = false;
var down = false;

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

//move based on currently pressed keys
function sendMove () {
    if (right && !left && up && !down) {
        socket.emit('move','rightup');
    }
    else if (!right && left && up && !down) {
        socket.emit('move','leftup');
    }
    else if (right && !left && !up && down) {
        socket.emit('move','rightdown');
    }
    else if (!right && left && !up && down) {
        socket.emit('move','leftdown');
    }
    else if (right && !left) {
        socket.emit('move','right');
    }
    else if (!right && left) {
        socket.emit('move','left');
    }
    else if (up && !down) {
        socket.emit('move','up');
    }
    else if (!up && down) {
        socket.emit('move','down');
    }
}