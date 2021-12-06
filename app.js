// TODO: ускорение спустя какое-то время реализовать, и следовательно исправить хардкод при ускорении скролла вверху канваса; начать анимацию только после нажатаия первой клавиши; продумать, как перестать анимировать под ходьбу падение с платформы 

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = 800;
const CANVAS_HEIGHT = canvas.height = 700;
let animation; // requestAnimationFrame
const states = {
  walkRight : null,
  walkLeft : null,
  jump : null,
}; // array of pressed keys
let gameFrame = 0; // adjust the player's movement speed
let jumpSound = new Audio();
jumpSound.src = 'audio/jump.mp3';
let stepsSound = new Audio();
stepsSound.src = 'audio/steps_on_grass.mp3'
let gameOverSound = new Audio();
gameOverSound.src = 'audio/whistle_air.mp3';
let isGaveOver = false;
let isGameOverSoundPlayed = false;

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

class Score {
  constructor() {
    this.scoreValue = 0;
    this.isIncreased = false;
  }

  drawScore() {
    ctx.font = '45px KinderBoys';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText(`Score: ${this.scoreValue}`, 15, 40);
    ctx.fillStyle = '#fff';
    ctx.fillText(`Score: ${this.scoreValue}`, 15, 40);
  }
}

const score = new Score();

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
    // background movement logic for starting layers
    } else if (this.startLayer && this.startLayerY < -2100) {
      this.startLayerY += this.speed;
    } else {
      this.y += this.speed;
    }
  }

  // rendering on canvas
  draw() {
    // starting layers rendering on canvas
    if (this.startLayer && this.startLayerY < -2100) {
      ctx.drawImage(this.image, this.x, this.startLayerY + this.height);
    } else if (!this.startLayer) {
      ctx.drawImage(this.image, this.x, this.y);
      ctx.drawImage(this.image, this.x, this.y + this.height);
    };
  };

  // if player jumped for the first time, layers begin to scroll
  startScroll() {
    if (player.isJumping && !this.isStarted) {
      this.scrollSpeed = 1;
      this.speed = this.scrollSpeed * this.speedModifier;
      this.isStarted = true;
    };
  };

  // if player jumps high, background movement is accelerating until he goes down again
  speedUp() {
    if (this.isStarted && player.y > 30 && !isGaveOver) {
      if (score.scoreValue <= 50) {
        player.jumpLength = 170;
        this.scrollSpeed = 1;
        this.speed = this.scrollSpeed * this.speedModifier;
      };
      if (score.scoreValue <= 100 && score.scoreValue > 50) {
        player.jumpLength = 160;
        this.scrollSpeed = 2;
        this.speed = this.scrollSpeed * this.speedModifier;
      };
      if (score.scoreValue <= 150 && score.scoreValue > 100) {
        player.jumpLength = 150;
        this.scrollSpeed = 3;
        this.speed = this.scrollSpeed * this.speedModifier;
      };
      if (score.scoreValue > 150) {
        player.jumpLength = 140;
        this.scrollSpeed = 4;
        this.speed = this.scrollSpeed * this.speedModifier;
      };
    } else if (player.y <= 30 && !isGaveOver) {
      if (score.scoreValue <= 50) {
        player.jumpLength = 150;
        this.scrollSpeed = 3;
        this.speed = this.scrollSpeed * this.speedModifier;
      };
      if (score.scoreValue <= 100 && score.scoreValue > 50) {
        player.jumpLength = 140;
        this.scrollSpeed = 4;
        this.speed = this.scrollSpeed * this.speedModifier;
      };
      if (score.scoreValue <= 150 && score.scoreValue > 100) {
        player.jumpLength = 130;
        this.scrollSpeed = 5;
        this.speed = this.scrollSpeed * this.speedModifier;
      };
      if (score.scoreValue > 150) {
        player.jumpLength = 120;
        this.scrollSpeed = 6;
        this.speed = this.scrollSpeed * this.speedModifier;
      };
    }
  }

  static updateAll() {
    layers.forEach(layer => layer.update());
    layers.forEach(layer => layer.startScroll());
    layers.forEach(layer => layer.speedUp());
  };

  static renderAll() {
    layers.forEach(layer => layer.draw());
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
    this.isFalling = false;
    this.isJumped = false; // is player made one jump
    this.startPoint = 360; // from where player jumps
    this.jumpLength = 170;
    this.isJumpSoundPlayed = false;
  };

  controlStates() {
    if (states.jump && this.isLanded && !this.isJumped) {
      this.isJumping = true;
    };
  }

  walkRight() {
    if (states.walkRight && !this.isJumping && this.x < CANVAS_WIDTH - this.width - 110) {
      if (this.isLanded && !this.isFalling) stepsSound.play()
      else if (!this.isLanded && this.isFalling) stepsSound.pause();
      this.x += this.speed;
      this.frameY = 2;
    
      if (this.frameX < 9) {
        this.frameX++;
      } else {
        this.frameX = 0;
      };
    } else if (this.isJumping) stepsSound.pause();
  }

  walkLeft() {
    if (states.walkLeft && !this.isJumping && this.x > 110) {
      if (this.isLanded && !this.isFalling) stepsSound.play()
      else if (!this.isLanded && this.isFalling) stepsSound.pause();
      this.x -= this.speed;
      this.frameY = 3;
      
      if (this.frameX < 9) {
        this.frameX++;
      } else {
        this.frameX = 0;
      }
    } else if (this.isJumping) stepsSound.pause();
  }

  jump() {
    if (this.isJumping && this.isLanded) {
      this.y -= 20;
      this.isJumpSoundPlayed = false;
      score.isIncreased = false;

      // if player walked to the right before the jump or did not walk before the first jump, he will jump to the right
      if (this.frameY === 2 || 0) {
        this.frameY = 0;
        // if he walked to the left, he will jump to the left
      } else if (this.frameY === 3) {
        this.frameY = 1;
      };

      // if during the jump player turns and moves to the other side
      if (states.walkLeft) { 
        this.frameY = 1;
        this.x -= this.speed;
      } else if (states.walkRight) {
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
      this.isFalling = true;

      // fall animation
      if (this.frameX > 4 && this.frameX < 9) this.frameX++;
      else if (this.frameX === 9) this.frameX = 0;

      // if player falls off the platform, the game stops
      if (this.y >= CANVAS_HEIGHT) {
        gameOver();
        isGaveOver = true;
      };
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
        score.scoreValue;
        if (states.jump) { // if player landed, but the key Arrow Up is still pressed, player won't jump
          player.isJumped = true;
        };
        if (!this.isJumpSoundPlayed) {
          setTimeout(() => {
            jumpSound.play();
          }, 150);
        };
        this.isJumpSoundPlayed = true;
        this.isFalling = false;
        if (!score.isIncreased) {
          score.scoreValue++;
        };
        score.isIncreased = true;
      }
    })
  }

  updateAll() {
    this.controlStates();
    if (gameFrame % 4 == 0) {
      this.walkRight();
      this.walkLeft();
      this.jump();
      this.fall();
    };
    this.land();
  }

  draw() {
    ctx.drawImage(playerImage, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
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
    if (this.visibility !== 'hidden') {
      ctx.drawImage(padImage, this.x, this.y);
    };
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
    if (player.isJumping && !this.isStarted) {
      this.speed = 1;
      this.isStarted = true;
    };
  }

  // if player jumps high, pads movement is accelerating until he goes down again
  speedUp() {
    if (this.isStarted && player.y > 30 && !isGaveOver) {
      if (score.scoreValue <= 50) this.speed = 1;
      if (score.scoreValue <= 100 && score.scoreValue > 50) this.speed = 2;
      if (score.scoreValue <= 150 && score.scoreValue > 100) this.speed = 3;
      if (score.scoreValue > 150) this.speed = 4;
    } else if (player.y <= 30 && !isGaveOver) {
      if (score.scoreValue <= 50) this.speed = 3;
      if (score.scoreValue <= 100 && score.scoreValue > 50) this.speed = 4;
      if (score.scoreValue <= 150 && score.scoreValue > 100) this.speed = 5;
      if (score.scoreValue > 150) this.speed = 6;
    }
  }

  static updateAll() {
    pads.forEach(pad => pad.movePads());
    pads.forEach(pad => pad.startScroll());
    pads.forEach(pad => pad.speedUp());
  }

  static renderAll() {
    pads.forEach(pad => pad.drawPads());
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
  if (!isGameOverSoundPlayed) {
    gameOverSound.play();
  };
  isGameOverSoundPlayed = true;
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
  Layer.updateAll();
  player.updateAll();
  Pad.updateAll();
};

// rendering
function render() {
  // clear canvas
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // draw all background layers
  Layer.renderAll();
  // draw platforms
  Pad.renderAll();
  // draw player
  player.draw();
  score.drawScore();
};

// start of the game
animate();

// controls
window.addEventListener('keydown', function(e) {
  if (states.walkRight && e.code === 'ArrowLeft') {
    states.walkRight = false;
    states.walkLeft = true;
  };
  if (states.walkLeft && e.code === 'ArrowRight') {
    states.walkLeft = false;
    states.walkRight = true;
  };
  if (e.code === 'ArrowRight') states.walkRight = true;
  if (e.code === 'ArrowLeft') states.walkLeft = true;
  if (e.code === 'ArrowUp') states.jump = true;
});
window.addEventListener('keyup', function(e) {
  if (e.code === 'ArrowRight') states.walkRight = false;
  if (e.code === 'ArrowLeft') states.walkLeft = false;
  if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') stepsSound.pause();
  if (e.code === 'ArrowUp') {
    states.jump = false;
    player.isJumped = false;
  }
});

