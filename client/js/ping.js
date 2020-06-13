// Ping checking system

var Ping = {

    interval: 0,

    waiting: false,

    time: 0,

    value: 0,

    start: function (socket) {

        //recieve pong from server
        socket.on('ponging', function () {
            this.waiting = false;
            this.value = Date.now() - this.time;
        }.bind(this));

        //clear old interval
        clearInterval(this.interval);

        //first ping
        this.waiting = true,
        this.time = Date.now();
        socket.emit('pinging');

        //start interval
        this.interval = setInterval(function () {
            if (!this.waiting) {
                this.waiting = true;
                this.time = Date.now();
                socket.emit('pinging');
            }
        //get rate from settings
        }.bind(this), gameSettings.pingRate);
    },

    stop : function () {
        clearInterval(this.interval);
    }.bind(this),
}