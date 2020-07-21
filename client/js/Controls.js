//handles controls
var Controls = {

    moveInterval: null,

    clickInterval: null,

    directionHandler: function (socket) {
        if (state == "game" &&
            gameState.players.playing &&
            socket.id in gameState.players.playing && 
            gameState.players.playing[socket.id].health > 0) {
                Movement.sendAngle(socket);
        }
    },

    clickHandler: function (socket) {
        if (state == "game" &&
            gameState.players.playing &&
            socket.id in gameState.players.playing && 
            gameState.players.playing[socket.id].health > 0) {
                Shoot.sendClicking(socket);
        }
    },

    start: function (socket) {
        //execute direction emits from movement.js
        clearInterval(this.moveInterval);
        this.moveInterval = setInterval(
            function () {this.directionHandler(socket)}.bind(this),
            //uses half of games tickRate
            gameSettings.tickRate/2 
        );

        //execute click emits from shoot.js
        clearInterval(this.clickInterval);
        this.clickInterval = setInterval(
            function () {this.clickHandler(socket)}.bind(this),
            //uses half of games tickRate
            gameSettings.tickRate/2 
        );

        //recieve and respond to shoot requests
        socket.on('shoot_request', function () {
            socket.emit(
                'shoot',
                mouseX+Render.screenOffset.x,
                mouseY+Render.screenOffset.y
            );
        });
    },

    stop: function () {
        clearInterval(this.moveInterval);
        this.moveInterval = null;
        clearInterval(this.clickInterval);
        this.clickInterval = null;
    },
}