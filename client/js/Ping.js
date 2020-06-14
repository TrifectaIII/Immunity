// Ping checking system

var Ping = {

    interval: null,

    waiting: false,

    time: 0,

    value: 0,

    //begin checking ping
    start: function (socket) {

        //recieve pong from server
        socket.on('ponging', function () {
            Ping.waiting = false;
            Ping.value = Date.now() - Ping.time;
        });

        //clear old interval
        clearInterval(Ping.interval);

        //first ping
        Ping.waiting = true,
        Ping.time = Date.now();
        socket.emit('pinging');

        //start interval
        Ping.interval = setInterval(function () {
            if (!Ping.waiting) {
                Ping.waiting = true;
                Ping.time = Date.now();
                socket.emit('pinging');
            }
        //get rate from settings
        }, gameSettings.pingRate);
    },

    //stop checking ping
    stop: function () {
        clearInterval(Ping.interval);
        Ping.interval = null;
    },
}