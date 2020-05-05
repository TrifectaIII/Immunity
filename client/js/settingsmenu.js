









// Settings Menu Functions
//////////////////////////////////////////////////////////////////////////////

//draw settings menus
function drawSettingsMenus () {
    //darken game screen
    background(0, 200);

    drawExitGameButton();

    drawMenuCrosshair();
}

function settingsMenuMouseClicked (socket) {
    if(exitGameButton.mouseOver()) {
        errors.displayError('Left Game', 5000);
        restartMenus();
        socket.close();
        return;
    }
}