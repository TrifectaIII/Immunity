//Global Server Settings from gameSettings.js
///////////////////////////////////////////////////////////////////////////

const gameSettings = require(__dirname + '/../gameSettings.js');


//Container Class for Extending from Container.js
///////////////////////////////////////////////////////////////////////////

const Container = require(__dirname + '/Container.js');


//Collision/Physics Functions from Physics.js
///////////////////////////////////////////////////////////////////////////

const Physics = require(__dirname + '/Physics.js');


//class for other ability classes to inherit
class Ability {

    constructor (player) {
        this.player = player;
    }
}

//turret ability
class Turret extends Ability {

     constructor (player) {

        super(player);
     }
}


// class for abilities container
class Abilities extends Container {

    constructor(room) {

        //call Container constructor
        super(room);
    }

    //updates all ability objects
    update() {

    }
}

//export to room
module.exports = Abilities;