//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require(__dirname + '/../gameSettings.js');


// class for object container classes to inherit
class Container {

    constructor (room) {

        //all containers need room reference
        this.room = room;

        //to store the objects in the container
        this.objects = {};
    }

    //counts objects currently in container
    count() {
        return Object.keys(this.objects).length;
    }
}

//export to individual container scripts
module.exports = Container;