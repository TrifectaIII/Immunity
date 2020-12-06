//module for tracking high scores
var Highscores = {

    //object to hold scores
    scores: [],

    //function to fetch high score info
    getScores: () => {

        //route to high score info
        fetch('./highscores')

            //convert to json
            .then((resp) => {
                return resp.json();
            })

            //set to object
            .then((jsonresp) => {
                Highscores.scores = jsonresp;
            })

            //error handling
            .catch((err) => {
                Highscores.scores = [];
                console.log("Could not access high scores, ", err);
            })
    },
}

Highscores.getScores();
setInterval(Highscores.getScores, gameSettings.highScoreDelay);