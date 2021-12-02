// TODO: когда эльф идет по платформе, это надо анимировать; когда удерживается клавиша вверх, прыжки повторяются, исправить; ускорение спустя какое-то время реализовать, и следовательно исправить хардкод при ускорении скролла вверху канваса

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 800;
const CANVAS_HEIGHT = canvas.height = 700;
let animation; // requestAnimationFrame
const keys = []; // array of pressed keys
let gameFrame = 0; // adjust the player's movement speed
let jumpSound = new Audio();
jumpSound.src = 'audio/jump.mp3';
let isGaveOver = false;

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
    this.startLayer = startLayer; // is a layer a starting one or not (if it is, it should be scrolled only once)
    this.x = 0;
    this.y = -this.height * 2 + CANVAS_HEIGHT; // -3452
    this.startLayerY = -this.height * 2 + CANVAS_HEIGHT; // -3452
    this.image = image;
    this.scrollSpeed = 0; // adjust the speed of background movement (parallax)
    this.speedModifier = speedModifier; // defines speed for each layer
    this.speed = this.scrollSpeed * this.speedModifier;
    this.isStarted = false; // is background movement started
  }

  // background movement logic
  update() {
    if (!this.startLayer && this.y > -this.height * 2 + CANVAS_HEIGHT + this.height) {
      this.y = -this.height * 2 + CANVAS_HEIGHT + this.speed * 2;
    } else {
      this.y += this.speed;
    };
  }

  // background movement logic for starting layers
  updateStartLayers() {
    if (this.startLayer && this.startLayerY < -2100) {
      this.startLayerY += this.speed;
    };
  }

  // rendering on canvas
  draw() {
    ctx.drawImage(this.image, this.x, this.y);
    ctx.drawImage(this.image, this.x, this.y + this.height);
  };

  // starting layers rendering on canvas
  drawStartLayers() {
    if (this.startLayer && this.startLayerY < -2100) {
      ctx.drawImage(this.image, this.x, this.startLayerY + this.height);
    }
  };

  // if player jumped for the first time, layers begin to scroll
  startScroll() {
    if (player.isJumping) {
      this.scrollSpeed = 1;
      this.speed = this.scrollSpeed * this.speedModifier;
      this.isStarted = true;
    };
  };

  // if player jumps high, background movement is accelerating until he goes down again
  speedUp() {
    if (this.isStarted && player.y > 50 && !isGaveOver) {
      player.jumpLength = 170;
      this.scrollSpeed = 1;
      this.speed = this.scrollSpeed * this.speedModifier;
    } else if (player.y <= 50 && !isGaveOver) {
      player.jumpLength = 150;
      this.scrollSpeed = 3;
      this.speed = this.scrollSpeed * this.speedModifier;
    }
  }
}

class Player {
  constructor() {
    this.x = 200;
    this.y = 360;
    this.width = 201;
    this.height = 249;
    this.frameX = 0; // position on the sprite sheet
    this.frameY = 0; // position on the sprite sheet
    this.speed = 15; // player movement speed
    this.isLanded = true; // is player on the ground
    this.isJumping = null;
    this.isWalkingRight = false;
    this.isWalkingLeft = false;
    this.startPoint = 360; // from where player jumps
    this.jumpLength = 170;
  };

  controlStates() {
    if (keys[39]) {
      this.isWalkingRight = true;
    } else {
      this.isWalkingRight = false;
    };
    if (keys[37]) {
      this.isWalkingLeft = true;
    } else {
      this.isWalkingLeft = false;
    };
    if (keys[38] && this.isLanded) {
      this.isJumping = true;
    };
  }

  walkRight() {
    if (this.isWalkingRight && !this.isJumping && this.x < CANVAS_WIDTH - this.width - 110) {
      this.x += this.speed;
      this.frameY = 2;
    
      if (this.frameX < 9) {
        this.frameX++;
      } else {
        this.frameX = 0;
      }
    }
  }

  walkLeft() {
    if (this.isWalkingLeft && !this.isJumping && this.x > 110) {
      this.x -= this.speed;
      this.frameY = 3;

      if (this.frameX < 9) {
        this.frameX++;
      } else {
        this.frameX = 0;
      }
    }
  }

  jump() {
    if (this.isJumping && this.isLanded) {
      this.y -= 20;

      // if player walked to the right before the jump or did not walk before the first jump, he will jump to the right
      if (this.frameY === 2 || 0) {
        this.frameY = 0;
        // if he walked to the left, he will jump to the left
      } else if (this.frameY === 3) {
        this.frameY = 1;
      };

      // if during the jump player turns and moves to the other side
      if (keys[37]) { 
        this.frameY = 1;
        this.x -= this.speed;
      } else if (keys[39]) {
        this.frameY = 0;
        this.x += this.speed;
      };

      if (this.frameX < 5) this.frameX++;

      if (this.y < this.startPoint - this.jumpLength) {
        this.isJumping = false;
      };
    }
  }

  fall() {
    if (this.isJumping === false) {
      this.y += 25;
      this.isLanded = false;

      // if during the fall player turns to the other side
      if (keys[37]) { 
        this.frameY = 1;
      } else if (keys[39]) {
        this.frameY = 0;
      };

      if (this.frameX > 4 && this.frameX < 9) this.frameX++;
      else this.frameX = 0;

      // if player falls off the platform, the game stops
      if (this.y >= CANVAS_HEIGHT) {
        gameOver();
        isGaveOver = true;
      }
    }
  }

  land() {
    // platform landing logic
    pads.forEach(pad => {
      if (
        this.y + this.height >= pad.y &&
        this.y + this.height <= pad.y + pad.height &&
        this.x + (this.width / 2) >= pad.x &&
        this.x + this.width - (this.width / 2) <= pad.x + pad.width &&
        this.isJumping === false
      ) {
        this.y = pad.y - this.height + 30; // + 30px to stand deeper on the pad
        this.startPoint = this.y;
        this.isLanded = true;
        //jumpSound.play();
      }
    })
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
    this.speed = 0; // adjust the speed of pads movement
    this.isStarted = false; // is pads movement started
    this.visibility = visibility; // lower pad is invisible until it goes beyond canvas border
    this.y = (this.padGap / 2 - this.height / 2) + index * this.padGap; // 46 + i + 175
    this.x = Math.round(Math.random() * (CANVAS_WIDTH - this.width - 110 - 110) + 110); // x is random between 110 and 440
  }

  drawPads() {
    ctx.drawImage(padImage, this.x, this.y);
  }

  // logic of pads movement
  movePads() {
    this.y += this.speed;
    if (this.y > CANVAS_HEIGHT) {
      this.y = -this.padGap;
      this.visibility = 'visible';
    }
  }

  // if player jumped for the first time, pads begin to scroll
  startScroll() {
    if (player.isJumping) {
      this.speed = 1;
      this.isStarted = true;
    };
  }

  // if player jumps high, pads movement is accelerating until he goes down again
  speedUp() {
    if (this.isStarted && player.y > 50 && !isGaveOver) {
      this.speed = 1;
    } else if (player.y <= 50 && !isGaveOver) {
      this.speed = 3;
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

function gameOver() {
  layers.forEach(layer => {
    layer.scrollSpeed = 0;
    layer.speed = layer.scrollSpeed * layer.speedModifier;
  });
  pads.forEach(pad => pad.speed = 0);
};

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
  layers.forEach(layer => layer.startLayer ? layer.updateStartLayers() : layer.update());
  layers.forEach(layer => layer.startScroll());
  layers.forEach(layer => layer.speedUp());

  player.controlStates();
  if (gameFrame % 4 == 0) {
    player.walkRight();
    player.walkLeft();
    player.jump();
    player.fall();
  };
  player.land();

  pads.forEach(pad => pad.movePads());
  pads.forEach(pad => pad.startScroll());
  pads.forEach(pad => pad.speedUp());
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

