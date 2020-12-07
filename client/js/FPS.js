//tracks framerate of game

var FPS = {

    //num that tracks rate
    rate: 0,

    //tracks number of frames seen so far this sec
    counter: 0,

    //access fps as int
    getFPS: function () {
        return Math.floor(FPS.rate);
    },

    //add a frame to the counter
    markFrame: function () {
        ++FPS.counter;
    },

    interval: null,
}

//update every second
FPS.interval = setInterval(function () {
    this.rate = this.counter;
    this.counter = 0;
}.bind(FPS), 1000);