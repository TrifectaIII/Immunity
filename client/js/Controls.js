//handles controls
var Controls = {

    moveInterval: null,

    clickInterval: null,

    directionHandler: function (socket) {
        if (state == "game" &&
            socket.id in playingData && 
            playingData[socket.id].health > 0) {
                sendDirection(socket);
        }
    },

    clickHandler: function (socket) {
        if (state == "game" &&
            socket.id in playingData && 
            playingData[socket.id].health > 0) {
                sendClicking(socket);
        }
    },

    start: function (socket) {
        //execute direction emits from movement.js
        clearInterval(Controls.moveInterval);
        Controls.moveInterval = setInterval(
            function () {Controls.directionHandler(socket);console.log('controlling!')},
            //uses half of games tickRate
            gameSettings.tickRate/2 
        );

        //execute click emits from shoot.js
        clearInterval(Controls.clickInterval);
        Controls.clickInterval = setInterval(
            function () {Controls.clickHandler(socket);console.log('controlling!')},
            //uses half of games tickRate
            gameSettings.tickRate/2 
        );

        //recieve and respond to shoot requests
        socket.on('shoot_request', function () {
            socket.emit(
                'shoot',
                mouseX+screenOffset.x,
                mouseY+screenOffset.y
            );
        });
    },

    stop: function () {
        clearInterval(Controls.moveInterval);
        Controls.moveInterval = null;
        clearInterval(Controls.clickInterval);
        Controls.clickInterval = null;
    },
}