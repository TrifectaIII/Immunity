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

    constructor (id, player) {

        this.id = id;

        this.player = player;
    }
}

//turret ability
class Turret extends Ability {

    constructor (id, player) {

        super(id, player);
    }

    update () {

    }
}

//freeze ability
class Freeze extends Ability {

    constructor (id, player) {

        super(id, player);
    }

    update () {

    }
}

//full-auto ability
class FullAuto extends Ability {

    constructor (id, player) {

        super(id, player);
    }

    update () {

    }
}

//shield ability
class Shield extends Ability {

    constructor (id, player) {

        super(id, player);
    }

    update () {

    }
}


// class for abilities container
class Abilities extends Container {

    constructor (room) {

        //call Container constructor
        super(room);

        this.idCounter = 0;
    }

    //updates all ability objects
    update () {

        //loop through all objects

    }

    //collect info on objects to send to clients
    collect () {

    }

    //spawns an ability for the player
    spawnAbility (player) {

        var ability;

        //generate id
        let id = 'ability' + (this.idCounter++).toString();

        //spawn ability based on player class
        switch (player.type) {
            case "soldier":
                ability = new Shield(id, player);
                break;
            case "engineer":
                ability = new Turret(id, player);
                break;
            case "sniper":
                ability = new FullAuto(id, player);
                break;
            case "heavy":
                ability = new Freeze(id, player);
                break;
        }

        //place into objects
        this.objects[id] = ability;
    }
}

//export to room
module.exports = Abilities;