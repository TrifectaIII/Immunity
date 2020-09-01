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

    update () {

    }
}

//freeze ability
class Freeze extends Ability {

    constructor (player) {

        super(player);
    }

    update () {

    }
}

//full-auto ability
class FullAuto extends Ability {

    constructor (player) {

        super(player);
    }

    update () {

    }
}

//shield ability
class Shield extends Ability {

    constructor (player) {

        super(player);
    }

    update () {

    }
}


// class for abilities container
class Abilities extends Container {

    constructor (room) {

        //call Container constructor
        super(room);
    }

    //updates all ability objects
    update () {

    }

    //spawns an ability for the player
    spawnAbility (player) {

    }

}

//export to room
module.exports = Abilities;