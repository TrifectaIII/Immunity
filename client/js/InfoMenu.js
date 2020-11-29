//info panel
var InfoMenu = {
    
    //get div elements
    div: document.querySelector('.InfoMenu'),
    scoresDiv: document.querySelector('.InfoMenu-scores'),

    //function to toggle display of settings
    toggle: () => {
        InfoMenu.div.classList.toggle('hidden');
    },

    updateScores: () => {
        InfoMenu.scoresDiv.innerHTML = '';
        Highscores.scores.forEach((scoreobj)=>{
            InfoMenu.scoresDiv.innerHTML+=`<p><b>${scoreobj.name}</b> - ${scoreobj.score} Waves</p>`
        });
    }
}

//toggle display of InfoMenu when button pressed
window.addEventListener('keypress', function (event) {
    if (event.keyCode == gameSettings.menuToggleButton.charCodeAt(0)) {

        //prevent default action
        event.preventDefault();

        InfoMenu.toggle();
    }
});

//event listener for close button
InfoMenu.div.querySelector('.InfoMenu-close').addEventListener(
    'click', 
    InfoMenu.toggle,
);

//event listener for exit game button
InfoMenu.div.querySelector('.InfoMenu-exit').addEventListener(
    'click', 
    function () {
        if (state === States.GAME || state === States.LOAD) {
            Error.displayError('Left Game', 5000);
            endGame();
        }
    },
);

//update scores
InfoMenu.updateScores();
setInterval(InfoMenu.updateScores, gameSettings.highScoreDelay/10);