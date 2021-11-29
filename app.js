const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 800;
const CANVAS_HEIGHT = canvas.height = 700;
let scrollSpeed = 0; // adjust the speed of background movement (parallax)
let animation;
const keys = []; // control
let gameFrame = 0; // adjust the player's movement speed

const backgroundLayer1 = new Image();
backgroundLayer1.src = '/bg/sky.png';
const backgroundLayer2 = new Image();
backgroundLayer2.src = '/bg/bg.png';
const backgroundLayer3 = new Image();
backgroundLayer3.src = '/bg/clouds.png';
const backgroundLayer4 = new Image();
backgroundLayer4.src = '/bg/sides.png';
const backgroundLayer5 = new Image();
backgroundLayer5.src = '/bg/decor.png';
const backgroundLayer6 = new Image();
backgroundLayer6.src = '/bg/start.png';

class Layer {
  constructor(image, speedModifier, startLayer = false) {
    this.width = 800;
    this.height = 2076;
    this.startLayer = startLayer;
    this.x = 0;
    this.y = -this.height * 2 + CANVAS_HEIGHT; // -3452
    this.startLayerY = -this.height * 2 + CANVAS_HEIGHT; // -3452
    this.image = image;
    this.speedModifier = speedModifier;
    this.speed = scrollSpeed * this.speedModifier;
  }

  update() {
    if (!this.startLayer && this.y > -this.height * 2 + CANVAS_HEIGHT + this.height) {
      this.y = -this.height * 2 + CANVAS_HEIGHT + this.speed * 2;
    } else {
      this.y += this.speed;
    };
  }

  updateStartLayers() {
    if (this.startLayer && this.startLayerY < -2100) {
      this.startLayerY += this.speed;
    };
  }

  draw() {
    ctx.drawImage(this.image, this.x, this.y);
    ctx.drawImage(this.image, this.x, this.y + this.height);
  };

  drawStartLayers() {
    if (this.startLayer && this.startLayerY < -2100) {
      ctx.drawImage(this.image, this.x, this.startLayerY + this.height);
    }
  }
}

class Player {
  constructor() {
    this.x = 200;
    this.y = 400;
    this.width = 201;
    this.height = 249;
    this.frameX = 0;
    this.frameY = 0;
    this.speed = 11;
    this.isJumping = false;
  };

  walkRight() {
    if (keys[39] && this.x < CANVAS_WIDTH - this.width - 110) {
      this.x += this.speed;
      this.frameY = 2;
      if (this.frameX < 9) player.frameX++
      else player.frameX = 0;
    }
  }

  walkLeft() {
    if (keys[37] && this.x > 110) {
      this.x -= this.speed;
      this.frameY = 3;
      if (this.frameX < 9) player.frameX++
      else player.frameX = 0;
    }
  }

  jump() {
    if(keys[38]) {
      this.isJumping = true;
      this.y -= 5;
    }
  }
};

const player = new Player();

const playerImage = new Image();
playerImage.src = '/elf/sprt.png';

const layer1 = new Layer(backgroundLayer1, 0.3);
const layer2 = new Layer(backgroundLayer2, 1, true);
const layer3 = new Layer(backgroundLayer3, 0.5);
const layer4 = new Layer(backgroundLayer4, 1);
const layer5 = new Layer(backgroundLayer5, 1);
const layer6 = new Layer(backgroundLayer6, 1, true);

const layers = [layer1, layer2, layer3, layer4, layer5, layer6];

class Pad {
  constructor(index, visibility = 'visible') {
    this.padCount = 4;
    this.padGap = CANVAS_HEIGHT / this.padCount; // 175
    this.height = 83;
    this.width = 250;
    this.speed = 0;
    this.visibility = visibility;
    this.y = (this.padGap / 2 - this.height / 2) + index * this.padGap; // 46 + i + 175
    this.x = Math.round(Math.random() * (CANVAS_WIDTH - this.width - 110 - 110) + 110); // x is random between 110 and 440
  }

  drawPads() {
    ctx.drawImage(padImage, this.x, this.y);
  }

  movePads() {
    this.y += this.speed;
    if (this.y > CANVAS_HEIGHT) {
      this.y = -this.padGap;
      this.visibility = 'visible';
    }
  }
}

const padImage = new Image();
padImage.src = '/bg/pad.png';

const pad0 = new Pad(-1); // invisible upper platform for smooth appearance
const pad1 = new Pad(0);
const pad2 = new Pad(1);
const pad3 = new Pad(2);
const pad4 = new Pad(3, 'hidden');

const pads = [pad0, pad1, pad2, pad3, pad4];

// main game loop
function animate() {
  cancelAnimationFrame(animation);
  update();
  render();
  gameFrame++; // regulate the player's movements speed
  animation = requestAnimationFrame(animate);
};

// logic of all changes
function update() {
  // make background layers move (parallax)
  layers.forEach(layer => layer.startLayer ? layer.updateStartLayers() : layer.update());

  // organize player's movements 
  if (gameFrame % 5 == 0) {
    player.walkRight();
    player.walkLeft();
    player.jump();
  };

  // make platfroms appear from above and move down
  pads.forEach(pad => pad.movePads());

  if (player.isJumping) {
    scrollSpeed = 1;
    pads.forEach(pad => pad.speed = 1);
  }
};

// rendering
function render() {
  // clear canvas
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // draw all background layers
  layers.forEach(layer => layer.startLayer ? layer.drawStartLayers() : layer.draw());
  
  // draw platforms
  pads.forEach(pad => pad.visibility === 'hidden' ? false : pad.drawPads());

  // draw player
  ctx.drawImage(playerImage, player.frameX * player.width, player.frameY * player.height, player.width, player.height, player.x, player.y, player.width, player.height);
};

// start of the game
animate();

// controls
window.addEventListener('keydown', function(e) {
  keys[e.keyCode] = true;
});
window.addEventListener('keyup', function(e) {
  delete keys[e.keyCode];
});

