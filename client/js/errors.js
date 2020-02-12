var errors = {
    active: false,

    message: "",

    timer: undefined,

    displayError: function (msg, time) {
        if (time > 0) {
            this.active = true;
            this.message = msg;
            clearTimeout(this.timer);
            this.timer = setTimeout(function () {
                errors.active = false;
            }, time);
        }
    },

    drawError: function () {
        if (this.active) {
            push();
            textAlign(CENTER, TOP);
            textSize(40);
            strokeWeight(2);
            stroke('black');
            fill('#FF004D');
            text(
                this.message, 
                windowWidth/2, 
                50,
            );
            pop();
        }
    }
}

// errors.displayError('Testing Testing 123',3000);