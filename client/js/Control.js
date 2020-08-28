//handles controls
var Control = {

    //intervals start empty, waiting for start() to be called
    moveInterval: null,
    clickInterval: null,
    abilityInterval: null,

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

    abilityHandler: function (socket) {
        if (state == States.GAME &&
            socket.id in gameState.players.playing) {
                Ability.sendActivation(socket);
        } 
    },

    //starts control system
    start: function (socket) {
        //execute direction emits from Movement.js
        clearInterval(this.moveInterval);
        this.moveInterval = setInterval(
            function () {this.directionHandler(socket)}.bind(this),
            //uses half of games tickRate
            gameSettings.tickRate/2 
        );

        //execute click emits from Shoot.js
        clearInterval(this.clickInterval);
        this.clickInterval = setInterval(
            function () {this.clickHandler(socket)}.bind(this),
            //uses half of games tickRate
            gameSettings.tickRate/2 
        );

        //execute ability usage from Ability.js
        clearInterval(this.abilityInterval);
        this.abilityInterval = setInterval(
            function () {this.abilityHandler(socket)}.bind(this),
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