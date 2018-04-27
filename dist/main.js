let loader = PIXI.loader,
    Sprite = PIXI.Sprite,
    application = PIXI.Application,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Rectangle = PIXI.Rectangle,
    Container = PIXI.Container;

let dungeon, explorer, treasure, id, healthBar;
let numberOfBlobs = 6,
    spacing = 48,
    speed = 2,
    blobs = [];

let up = new keyboard(87),
    down = new keyboard(83),
    left = new keyboard(65),
    right = new keyboard(68);
//Create a Pixi Application
let app = new application({
    width: 510,
    height: 510,
    antialias: true,
    transparent: false,
    resolution: 1
});

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

loader.add('./treasureHunter.json').load(setup)

function setup() {
    dungeon = new Sprite(TextureCache["dungeon.png"]);
    app.stage.addChild(dungeon);

    explorer = new Sprite(TextureCache["explorer.png"]);
    explorer.x = 68;
    explorer.y = app.stage.height / 2 - explorer.height / 2;
    explorer.vx = speed;
    explorer.vy = speed;
    app.stage.addChild(explorer);

    treasure = new Sprite(TextureCache["treasure.png"]);
    treasure.x = app.stage.width - treasure.width - 48;
    treasure.y = app.stage.height / 2 - treasure.height / 2;
    app.stage.addChild(treasure);

    for (let i = 0; i < numberOfBlobs; i++) {
        const blob = new Sprite(TextureCache["blob.png"]);
        blob.vy = speed * (i % 2 == 0 ? -1 : 1);
        blob.y = randomInt(0, (app.stage.height - blob.height))
        blob.x = 48 * i + 150
        blobs.push(blob);
        app.stage.addChild(blob)
    }

    //Create the health bar
    healthBar = new PIXI.Container();
    healthBar.position.set(app.stage.width - 170, 4)
    app.stage.addChild(healthBar);

    //Create the black background rectangle
    let innerBar = new PIXI.Graphics();
    innerBar.beginFill(0x000000);
    innerBar.drawRect(0, 0, 128, 8);
    innerBar.endFill();
    healthBar.addChild(innerBar);

    //Create the front red rectangle
    let outerBar = new PIXI.Graphics();
    outerBar.beginFill(0xFF3300);
    outerBar.drawRect(0, 0, 128, 8);
    outerBar.endFill();
    healthBar.addChild(outerBar);

    healthBar.outer = outerBar;

    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {
    if (up.isDown && !(contain(explorer, { x: 28, y: 10, width: 488, height: 480 }) == "top")) {
        explorer.y += -explorer.vx
    } else if (left.isDown && !(contain(explorer, { x: 28, y: 10, width: 488, height: 480 }) == "left")) {
        explorer.x += -explorer.vx
    } else if (down.isDown && !(contain(explorer, { x: 28, y: 10, width: 488, height: 480 }) == "bottom")) {
        explorer.y += explorer.vx
    } else if (right.isDown && !(contain(explorer, { x: 28, y: 10, width: 488, height: 480 }) == "right")) {
        explorer.x += explorer.vx
    }

    explorerHits = 0;
    blobs.forEach(i => {
        i.y += i.vy;
        let blobHitsWall = contain(i, { x: 28, y: 10, width: 488, height: 480 });
        if (blobHitsWall === "top" || blobHitsWall === "bottom") {
            i.vy *= -1;
        }
        if(hitTestRectangle(explorer, i)) {
            explorerHits += 1;
          }
    })

    if(explorerHits) {
        explorer.alpha = 0.5;
        healthBar.outer.width -= healthBar.outer.width > 0 ? (1 * explorerHits) : 0;
      } else {
        explorer.alpha = 1;
      }

      explorerHits = 0

      if (hitTestRectangle(explorer, treasure)) {
        treasure.x = explorer.x + 8;
        treasure.y = explorer.y + 8;
      }
}

function hitTestRectangle(r1, r2) {

    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    //hit will determine whether there's a collision
    hit = false;

    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;

    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;

    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {

        //A collision might be occuring. Check for a collision on the y axis
        if (Math.abs(vy) < combinedHalfHeights) {

            //There's definitely a collision happening
            hit = true;
        } else {

            //There's no collision on the y axis
            hit = false;
        }
    } else {

        //There's no collision on the x axis
        hit = false;
    }

    //`hit` will be either `true` or `false`
    return hit;
};

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function contain(sprite, container) {

    let collision = undefined;

    //Left
    if (sprite.x < container.x) {
        sprite.x = container.x;
        collision = "left";
    }

    //Top
    if (sprite.y < container.y) {
        sprite.y = container.y;
        collision = "top";
    }

    //Right
    if (sprite.x + sprite.width > container.width) {
        sprite.x = container.width - sprite.width;
        collision = "right";
    }

    //Bottom
    if (sprite.y + sprite.height > container.height) {
        sprite.y = container.height - sprite.height;
        collision = "bottom";
    }

    //Return the `collision` value
    return collision;
}

function keyboard(keyCode) {
    let key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = event => {
      if (event.keyCode === key.code) {
        if (key.isUp && key.press) key.press();
        key.isDown = true;
        key.isUp = false;
      }
      event.preventDefault();
    };
  
    //The `upHandler`
    key.upHandler = event => {
      if (event.keyCode === key.code) {
        if (key.isDown && key.release) key.release();
        key.isDown = false;
        key.isUp = true;
      }
      event.preventDefault();
    };
  
    //Attach event listeners
    window.addEventListener(
      "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
      "keyup", key.upHandler.bind(key), false
    );
    return key;
  }