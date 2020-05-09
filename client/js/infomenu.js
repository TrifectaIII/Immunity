//info panel

var infomenu = {

    //get div element
    div: document.querySelector('.infomenu'),

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
    
    //button for toggle
    toggleButton: '/',
}

//default is hidden
infomenu.div.style.display = 'none';

//toggle display of infomenu when button pressed
window.addEventListener('keypress', function (event) {
    if (event.keyCode == infomenu.toggleButton.charCodeAt(0)) {
        infomenu.toggle();
    }
});

//event listener for close button
document.querySelector('.infomenu .infomenu-close').addEventListener(
    'click', 
    infomenu.toggle.bind(infomenu)
);

//event listener for exit game button
document.querySelector('.infomenu .infomenu-exit').addEventListener(
    'click', 
    function () {
        errors.displayError('Left Game', 5000);
        restartMenus();
        socket.close();
        return;
    }
);