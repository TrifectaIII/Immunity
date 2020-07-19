//info panel

var InfoMenu = {

    //get div element
    div: document.querySelector('.InfoMenu'),

    //function to toggle display of settings
    toggle: function () {
        if (this.div.style.display == 'none') {
            this.div.style.display = 'initial';
        }
        else if (
            this.div.style.display == 'initial' ||
            this.div.style.display == ''
        ) {
                this.div.style.display = 'none';
        }
    },
}

//default is hidden
InfoMenu.div.style.display = 'none';

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
        restartMenus();
        socket.close();
        return;
    }
);