/** BOMBERMAN **/

var g_canvas = document.getElementById("myCanvas");
var g_ctx = g_canvas.getContext("2d");
var g_winGame = false;

var g_scale = 1;


var KEY_PLUS = keyCode('j');
var KEY_MINUS = keyCode('k');

function gatherInputs() {
    // Nothing to do here!
    // The event handlers do everything we need for now.
}

function Zoom(z) {
    g_scale = g_scale - z;
}

// GAME-SPECIFIC UPDATE LOGIC

function updateSimulation(du) {

    processDiagnostics();

    if(entityManager._startGame)
        entityManager.update(du);

    if(entityManager._paused)
        entityManager.update(du);

    if(eatKey(KEY_PLUS)){
        Zoom(-0.1);
    }
     if(eatKey(KEY_MINUS)){
        Zoom(+0.1);
    }
}

// GAME-SPECIFIC DIAGNOSTICS

var g_renderSpatialDebug = false;

var KEY_ENTER = keyCode('\r\n');

var KEY_SPATIAL = keyCode('X');

function processDiagnostics() {
    if (eatKey(KEY_SPATIAL)) g_renderSpatialDebug = !g_renderSpatialDebug;

    //A flag that starts the game, only if adventure is selected.
    if(entityManager._selection == false){ 
        //A flag that prevents pressing enter while a game has started.
        if(entityManager._flag == false){ 
            if (eatKey(KEY_ENTER)){
            entityManager.gameStart();
            entityManager._flag = !entityManager._flag;
            }
        }
    }
}

// GAME-SPECIFIC RENDERING

function renderSimulation(ctx) {
    // save the context+
    ctx.save();

    ctx.scale(g_scale,g_scale);

    //move the context
    if (entityManager._startGame) {  
        if(g_ui._key === 4){
            g_winGame = true;
        }
         entityManager._game[0].render(ctx); 

        //translate magic
        g_camera.camera(ctx);

        //If the game is paused we inhibit rendering of other entities
        if(!g_isUpdatePaused){
            if(!g_winGame){ 

                //added g_map to render
                g_map.render(ctx);

                entityManager.render(ctx);
        
                if (g_renderSpatialDebug) spatialManager.render(ctx);
            }
        }

        // after everything is drawn, restore the ctx
        ctx.restore();

        if(!g_isUpdatePaused){
            if(!g_winGame){ 
                g_ui.render(ctx);
            }
        }

    } else {
        // Render start entities
        entityManager._start[0].render(ctx);
    }
    
}

// Preload images

var g_images = {};

function requestPreloads() {

    var requiredImages = {

        // Player sprite images
        0 : "assets/playerwalkright.png", 1 : "assets/playerwalkright2.png",
        2 : "assets/playerwalkleft.png", 3 : "assets/playerwalkleft2.png",
        4 : "assets/playerwalkup.png", 5 : "assets/playerwalkup2.png",
        6 : "assets/playerwalkdown.png", 7 : "assets/playerwalkdown2.png",

        // Bomb image
        8 : "assets/bomb.png",

        // Explosion sprite
        9 : "assets/explosion.png",

        // Player explosion sprite sheet
        10 : "assets/playerexplode.png",

        // Enemy sprite sheet
        11 : "assets/enemy-pixilart.png",

        // Start menu images
        12 : "assets/StartMenu1.png",
        13 : "assets/StartMenu2.png",

        // Collectables
        14 : "assets/banemask.png",
        15 : "assets/gladmask.png",
        16 : "assets/sawpuppet.png",
        17 : "assets/vmask.png",

        // map walls/bricks
        18 : "assets/brick.png",
        19 : "assets/breakable1.png",
        20 : "assets/floor.png",

        // a key
        21 : "assets/key.png",
        // a gate
        22 : "assets/gate.png",
        // versus menu
        23 : "assets/Versus.png",
        // pause menu
        24 : "assets/PauseMenu.png",
        // game over screen
        25 : "assets/GameOver.png",
        // game win screen
        26 : "assets/GameWin.png",

        // Enemy explosion sprites
        27 : "assets/enemyexplode.png"

    };

    imagesPreload(requiredImages, g_images, preloadDone);
}

/**
 * Player sprites: 0-7
 * Enemy main sprite: 8
 * Bomb sprite: 9
 * Explosion sprites: 10 - 32
 * Player Explosion sprites: 33 - 42
 * Start menu sprites: 43 - 44
 * Enemy explosion sprites: 58 - 64
 */
var g_sprites = [];
var g_playerSprites = 8;
var g_enemySprites = 1; 
var g_explOffset = g_playerSprites + g_enemySprites + 1; 
var g_explSprites = 22;
var g_playerExplOffset = g_explOffset + g_explSprites;
var g_playerExplSprites = 9;
var g_enemyExplOffset = 51;
var g_enemyExplSprites = 6;


function preloadDone() {

    // Enemy sprites
    g_sprites[g_playerSprites] = new Sprite(g_images[11]);
    g_sprites[g_playerSprites].scale = 2;

    // Player sprites
    for (var i = 0; i < g_playerSprites; i++) {
        g_sprites[i] = new Sprite(g_images[i]);
    }

    // Player sprite images scaled
    for (var i = 0; i < g_playerSprites; i++) {
        g_sprites[i].scale = 2;
    }

    // Bomb sprite
    g_sprites[g_playerSprites + g_enemySprites] = new Sprite(g_images[8]);

    // Explosion sprite
    var celWidth = 32;
    var celHeight = 32;
    var numCols = 8;
    var numRows = 3;
    var numCels = 22;
    
    var sprite;
    
    for (var row = 0; row < numRows; ++row) {
        for (var col = 0; col < numCols; ++col) {
            sprite = new AnimatingSprite(col * celWidth, row * celHeight,
                                celWidth, celHeight, g_images[9]) 
            g_sprites.push(sprite);
        }
    }

    // Remove any superfluous ones from the end
    g_sprites.splice(numCels + g_playerSprites + g_enemySprites + 1);

    // Player explosion sprite
    var playerCelWidth = 31;
    var playerCelHeight = 27.3;
    var playerNumCols = 3;
    var playerNumRows = 3;
    //var playerNumCells = 9;

    var explPlayerSprite;
    
    for (var i = 0; i < playerNumRows; ++i) {
        for (var j = 0; j < playerNumCols; ++j) {
            explPlayerSprite = new AnimatingSprite(j * playerCelWidth, 
                i * playerCelHeight, 
                playerCelWidth, playerCelHeight, g_images[10])
            g_sprites.push(explPlayerSprite);
        }
    }

    // Start menu sprite
    g_sprites[43] = new Sprite(g_images[12]);
    g_sprites[44] = new Sprite(g_images[13]);

    // collectable sprites
    g_sprites[45] = new Sprite(g_images[14]);
    g_sprites[46] = new Sprite(g_images[15]);
    g_sprites[47] = new Sprite(g_images[16]);
    g_sprites[48] = new Sprite(g_images[17]);

    // walls
    g_sprites[49] = new Sprite(g_images[18]);
    // breakable
    g_sprites[50] = new Sprite(g_images[19]);
    // floor
    g_sprites[51] = new Sprite(g_images[20]);

    //key
    g_sprites[52] = new Sprite(g_images[21]);
    //key
    g_sprites[53] = new Sprite(g_images[22]);
    //Versus menu sprite
    g_sprites[54] = new Sprite(g_images[23]);
    //Pause menu sprite
    g_sprites[55] = new Sprite(g_images[24]);
    //Game over sprite
    g_sprites[56] = new Sprite(g_images[25]);
    //Game win sprite
    g_sprites[57] = new Sprite(g_images[26]);


    // Enemy explosion sprites
    var enemyCelWidth = 32;
    var enemyCelHeight = 32;
    var enemyNumCols = 1;
    var enemyNumRows = 6;
   
    var enemyExplSprite;

    for (var i = 0; i < enemyNumRows; i++) {
        for (var j = 0; j < enemyNumCols; ++j) {
            enemyExplSprite = new AnimatingSprite(j * enemyCelWidth, 
                i * enemyCelHeight, 
                enemyCelWidth, enemyCelHeight, g_images[27])
            g_sprites.push(enemyExplSprite);
        }
    }
    

    entityManager.init();

    g_map.generateMap();

    main.init();
}

// Kick it off
requestPreloads();