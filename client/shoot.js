setTimeout (function () {
    var canvas = document.querySelector('canvas');

    canvas.addEventListener('click', function (event) {
        event.preventDefault();
        socket.emit('shoot', Math.round(mouseX), Math.round(mouseY));
    })
},100)
