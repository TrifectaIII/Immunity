//info panel

var InfoMenu = {
    
    //get div element
    div: document.querySelector('.InfoMenu'),

    //function to toggle display of settings
    toggle: function () {
        this.div.classList.toggle('hidden');
    },
}

//toggle display of InfoMenu when button pressed
window.addEventListener('keypress', function (event) {
    if (event.keyCode == gameSettings.menuToggleButton.charCodeAt(0)) {
        InfoMenu.toggle();
    }
});

//event listener for close button
InfoMenu.div.querySelector('.InfoMenu-close').addEventListener(
    'click', 
    InfoMenu.toggle.bind(InfoMenu)
);

//event listener for exit game button
InfoMenu.div.querySelector('.InfoMenu-exit').addEventListener(
    'click', 
    function () {
        Errors.displayError('Left Game', 5000);
        endGame();
        return;
    }
);