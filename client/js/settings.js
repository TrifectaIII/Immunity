//settings menu 

//get settings div element
settingsDiv = document.querySelector('.settings');

//default is hidden
settingsDiv.style.display = 'none';

//button for toggle
settingsToggleChar = '/';

//toggle display of settings when button pressed
window.addEventListener('keypress', function (event) {

    //check for exact button
    if (event.keyCode == settingsToggleChar.charCodeAt(0)) {

        //toggle display
        if (settingsDiv.style.display == 'none') {
            settingsDiv.style.display = 'initial';
        }
        else if (settingsDiv.style.display == 'initial' ||
                 settingsDiv.style.display == '') {
                    settingsDiv.style.display = 'none';
        }
    }
});