// Error Message System

var Errors = {
    //switch for whether or not error is shown
    active: false,

    //shown error message
    message: "",

    //Timeout object to shut off Message
    timer: undefined,

    //sets error to display with certain message for certain ms
    displayError: function (msg, time) {
        if (time > 0) {
            this.active = true;
            this.message = msg;
            clearTimeout(this.timer);
            this.timer = setTimeout(function () {
                this.active = false;
            }.bind(this), time);
        }
    },

    // hides error message early
    hideError: function () {
        clearTimeout(this.timer);
        this.active = false;
    },

    //draws error on screen
    drawError: function () {
        if (this.active) {
            push();
            textAlign(CENTER, TOP);
            textSize(40);
            strokeWeight(2);
            stroke('black');
            fill(gameSettings.colors.red);
            text(
                this.message, 
                windowWidth/2, 
                50,
            );
            pop();
        }
    },
}

// EXAMPLE ERROR EMIT
// Errors.displayError('Testing Testing 123',3000);