// out-of-game menu system
var Menu = {

    // draw cosshair for menu
    drawMenuCrosshair: function () {
        push();
        stroke("black");
        strokeWeight(2);
        fill(0,0);
        ellipse(mouseX, mouseY, 30, 30);
        line(mouseX+20, mouseY, mouseX-20, mouseY);
        line(mouseX, mouseY+20, mouseX, mouseY-20);
        pop();
    },

    //draw grid background for menus
    menuGridOffset: 0,

    drawMenuGrid: function () {
        push();
        background('#FFF1E8');
        strokeWeight(1);
        stroke('#C2C3C7');
    
        this.menuGridOffset = (this.menuGridOffset+1)%100;
    
        for (let x = this.menuGridOffset; x < windowWidth; x+=100) {
            line(
                x, 0,
                x, windowHeight
            );
        }
        for (let y = this.menuGridOffset; y < windowHeight; y+=100) {
            line(
                0, y,
                windowWidth, y
            );
        }
        pop();
    },

    //button to go to previous menu
    backButton: new Button(
        "BACK",
        gameSettings.colors.darkpink,
        gameSettings.colors.pink
    ),

    drawBackButton: function () {
        this.backButton.update(
            100, 
            windowHeight - 100, 
            windowHeight/8, 
            windowHeight/8
        );
        this.backButton.draw();
    },

    startButton: new Button(
        "START",
        gameSettings.colors.darkgreen,
        gameSettings.colors.green
    ),

    // TITLE MENU
    /////////////////////////////////////////
    drawTitleMenu: function () {

        push();

        textAlign(CENTER, CENTER);

        //update and draw set name button
        this.startButton.update(
            windowWidth/2,
            windowHeight*2/3, 
            windowWidth/4, 
            windowHeight/8
        );
        this.startButton.draw();

        //draw title
        stroke('black');
        strokeWeight(8);
        fill(Animation.getColor());
        textSize(100);
        text(gameSettings.title.toUpperCase(), windowWidth/2, windowHeight/3);

        //draw controls
        strokeWeight(2);
        fill('black');
        textSize(40);
        text("WASD to Move\nClick to Shoot", windowWidth/2, windowHeight/2);

        //draw menu hint
        textSize(35);
        text(
            "Press " + gameSettings.menuToggleButton + " to open the info menu at any time.",
            windowWidth/2, 30,
        );

        pop();
    },

    clickTitleMenu: function () {
        return this.startButton.mouseOver();
    },

    // NAME MENU
    /////////////////////////////////////////

    //input element to type in name
    nameInput: new TextInput(gameSettings.nameMax),

    //button to submit name
    setNameButton: new Button(
        "SUBMIT", 
        gameSettings.colors.darkblue, 
        gameSettings.colors.blue
    ),

    drawNameMenu: function (canvas) {

        push();
        textAlign(CENTER, CENTER);

        //update and draw set name button
        this.setNameButton.update(
            windowWidth/2,
            windowHeight*2/3, 
            windowWidth/4, 
            windowHeight/8
        );
        this.setNameButton.draw();

        //draw text for name entry
        stroke('black');
        strokeWeight(2);
        fill('black');
        textSize(40);
        text("Enter Name:", windowWidth/2, windowHeight/3);

        //display input for name entry
        this.nameInput.showAt(
            canvas,
            windowWidth/2, 
            windowHeight/2, 
            windowWidth/3, 
            75
        );

        pop();
    },

    clickNameMenu: function () {
        return this.setNameButton.mouseOver();
    },

    // SERVER MENU
    /////////////////////////////////////////

    //input element to type in game code
    codeInput: new TextInput(gameSettings.nameMax),

    createGameButton: new Button( 
        "NEW GAME", 
        gameSettings.colors.darkgreen, 
        gameSettings.colors.green
    ),

    joinButton: new Button( 
        "JOIN", 
        gameSettings.colors.darkblue, 
        gameSettings.colors.blue
    ),

    drawServerMenu: function (canvas) {

        push();
        textAlign(CENTER, CENTER);

        //update and draw buttons
        this.createGameButton.update(
            windowWidth/2, 
            windowHeight/4, 
            windowWidth/4, 
            windowHeight/8
        );
        this.joinButton.update(
            windowWidth/2, 
            windowHeight*5/6, 
            windowWidth/5, 
            windowHeight/8
        );

        this.createGameButton.draw();
        this.joinButton.draw();

        //draw text for code entry
        stroke('black');
        strokeWeight(2);
        fill('black');
        textSize(40);
        text("- OR -", windowWidth/2, windowHeight*17/40);
        text("Enter Game Code:", windowWidth/2, windowHeight*16/30);

        //display input for game code
        this.codeInput.showAt(
            canvas,
            windowWidth/2, 
            windowHeight*2/3,
            windowWidth/4,
            75
        );

        pop();
    },

    clickServerMenu: function () {
        if (this.createGameButton.mouseOver()) {
            return "new_game";
        }
        if (this.joinButton.mouseOver()) {
            return "join";
        }
        return false;
    },

    // LOADING SCREEN
    /////////////////////////////////////////

    drawLoading: function () {
        push();
        textAlign(CENTER, CENTER);

        //draw background
        this.drawMenuGrid();

        //draw text
        stroke('black');
        strokeWeight(2);
        fill('black');
        textSize(40);
        text("Loading...", windowWidth/2, windowHeight/2);
        stroke(Animation.getColor());
        strokeWeight(10);
        let spokes = 3;
        let spokeLength = 25;
        for (let i=1; i<=spokes; i++) {
            line(
                windowWidth/2 - Math.sin(this.loadingProg+(Math.PI/spokes)*i) * spokeLength, 
                windowHeight/3*2 - Math.cos(this.loadingProg+(Math.PI/spokes)*i) * spokeLength,
                windowWidth/2 + Math.sin(this.loadingProg+(Math.PI/spokes)*i) * spokeLength,
                windowHeight/3*2 + Math.cos(this.loadingProg+(Math.PI/spokes)*i) * spokeLength,
            );
        }
        
        this.drawMenuCrosshair();

        pop();
    },

    // Menu State Machine
    /////////////////////////////////////////

    menuChoices: {
        name: '',
        roomId: '',
        className: '',
    },
    
    //list of menu progression (first to last)
    menuList: ['title', 'name', 'server'],
    
    //tracks which menu we are on, starts at first
    menuIndex: 0,
    
    //draws each menu
    drawMenus: function (canvas) {
    
        //draw background
        this.drawMenuGrid();
    
        //draw contents of menu based on state
        switch (this.menuList[this.menuIndex]) {
    
            //draw title menu
            case 'title':
                this.drawTitleMenu();
                break;
    
            //draw name menu
            case 'name':
                this.drawNameMenu(canvas);
                break;
    
            //draw server menu
            case 'server':
                this.drawServerMenu(canvas);
                break;
        }
    
        if (this.menuIndex > 0) {
            this.drawBackButton();
        }
    
        //draw mouse crosshair
        this.drawMenuCrosshair();
    
        //if at the end of menus, try to join game
        if (this.menuIndex == this.menuList.length) {
            joinGame(this.menuChoices);
        }
    },
    
    //checks for clicks when menu is active
    menuMouseClicked: function () {
    
        //go back 1 if button clicked
        if (this.backButton.mouseOver() && this.menuIndex > 0) {
            this.menuIndex--;
            this.nameInput.hide();
            this.codeInput.hide();
            return;
        }
    
        //otherwise, menu specific
        switch (this.menuList[this.menuIndex]) {
    
            case 'title':
                if (this.clickTitleMenu()) {
                    this.menuIndex++;
                }
                break;
    
            case 'name':
                if (this.clickNameMenu() && this.nameInput.getValue() != '') {
                    this.menuChoices.name = this.nameInput.getValue();
                    this.nameInput.hide();
                    this.menuIndex++;
                }
                break;
            
            case 'server':
                switch (this.clickServerMenu()) {
                    case 'new_game':
                        this.menuChoices.roomId = 'new_game';
                        this.codeInput.hide();
                        this.menuIndex++;
                        break;
                    case 'join':
                        if (this.codeInput.getValue() != '') {
                            this.menuChoices.roomId = this.codeInput.getValue();
                            this.codeInput.hide();
                            this.menuIndex++;
                        }
                        break;
                }
                break;
        }
    },
    
    //checks for key presses when menu is active
    menuKeyPressed: function (keyCode) {
        switch (this.menuList[this.menuIndex]) {
    
            case 'name':
                if (keyCode == ENTER) {
                    if (this.nameInput.getValue() != '') {
                        this.menuChoices.name = this.nameInput.getValue();
                        this.nameInput.hide();
                        this.menuIndex++;
                    }
                    return false;
                }
                break;
    
            case 'server':
                if (keyCode == ENTER) {
                    if (this.codeInput.getValue() != '') {
                        this.menuChoices.roomId = this.codeInput.getValue();
                        this.codeInput.hide();
                        this.menuIndex++;
                    }
                    return false;
                }
                break;
        }
    },
    
    //resets state to first menu
    restartMenus: function () {
    
        //hide inputs
        this.nameInput.hide();
        this.codeInput.hide();

        //remove game code input contents
        this.codeInput.clear();
    
        //set index to first menu in list
        this.menuIndex = 0;
    }
}

