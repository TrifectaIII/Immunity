//handles controls
var Control = {

    //intervals start empty, waiting for start() to be called
    moveInterval: null,
    clickInterval: null,
    superInterval: null,

    //sends direction info to server using Movement.js
    directionHandler: function (socket) {
        if (state == States.GAME &&
            socket.id in gameState.players.playing) {
                Movement.sendAngle(socket);
        }
    },

    //sends click info to server using Shoot.js
    clickHandler: function (socket) {
        if (state == States.GAME &&
            socket.id in gameState.players.playing) {
                Shoot.sendClicking(socket);
        }
    },

    superHandler: function (socket) {
        if (state == States.GAME &&
            socket.id in gameState.players.playing) {
                Super.sendActivation(socket);
        } 
    },

    //starts control system
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

        //execute ability usage from super.js
        clearInterval(this.superInterval);
        this.superInterval = setInterval(
            function () {this.superHandler(socket)}.bind(this),
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

    //stops control system
    stop: function () {
        clearInterval(this.moveInterval);
        this.moveInterval = null;
        clearInterval(this.clickInterval);
        this.clickInterval = null;
    },
}