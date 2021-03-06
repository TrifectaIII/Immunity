//ui element classes used by multiple other files

//Button Object Constructor
//////////////////////////////////////////

function Button (text, colorOff, colorOn) {
    this.text = text;
    this.colorOn = colorOn;
    this.colorOff = colorOff;
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
}

Button.prototype.update = function (x,y,w,h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
}

//checks if mouse is over the button
Button.prototype.mouseOver = function () {
    return (mouseX > this.x - this.w/2 &&
        mouseX < this.x + this.w/2 &&
        mouseY > this.y - this.h/2 &&
        mouseY < this.y + this.h/2);
}

//draws button
Button.prototype.draw = function () {
    push();
    textAlign(CENTER, CENTER);
    //draw box
    stroke('black');
    strokeWeight(4);
    fill(this.colorOff);
    if (this.mouseOver()) {
        fill(this.colorOn);
    }
    rect(
        this.x-this.w/2,
        this.y-this.h/2, 
        this.w, 
        this.h
    );

    //draw text
    stroke('black');
    strokeWeight(4);
    fill(gameSettings.colors.white);
    textSize(40);
    text(this.text, this.x, this.y);
    pop();
}

Button.prototype.updateAndDraw = function (x,y,w,h) {
    this.update(x,y,w,h)
    this.draw();
}

// TextInput Object Constructor
//////////////////////////////////////////

function TextInput (maxLength) {
    this.element = false;
    this.maxLength = maxLength;
}

// returns value of the input
TextInput.prototype.getValue = function () {
    if (!this.element) {
        return ''
    }
    return this.element.elt.value.trim();
}

// hides input
TextInput.prototype.hide = function () {
    if (this.element) {
        this.element.hide();
    }
}

TextInput.prototype.clear = function () {
    if (this.element) {
        this.element.elt.value = '';
    } 
}

//shows input at certain location and size
TextInput.prototype.showAt = function (canvas, x, y, w, h) {
    //setup element if not created yet
    if (!this.element) {
        this.element = createElement('input');
        this.element.class('gameInput');
        this.element.elt.maxLength = this.maxLength;
    }
    //show at given location with given size
    this.element.size(w,h);
    this.element.position(
        canvas.position().x + x - w/2,
        canvas.position().y + y - h/2
    )
    this.element.show();
}