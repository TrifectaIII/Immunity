var ping = {

    interval: 0,

    waiting: false,

    time: 0,

    value: 0,

    start: function (socket) {

        //recieve pong from server
        socket.on('ponging', function () {
            ping.waiting = false;
            ping.value = (new Date()).getTime() - ping.time;
        });

        //clear old interval
        clearInterval(ping.interval);

        //first ping
        ping.waiting = true,
        ping.time = (new Date()).getTime();
        socket.emit('pinging');

        //start interval
        ping.interval = setInterval(function () {
            if (!ping.waiting) {
                ping.waiting = true;
                ping.time = (new Date()).getTime();
                socket.emit('pinging');
            }
        //get rate from settings
        }, gameSettings.pingRate);
    },
}