// TODO: SCORE, RESTART, звук прыжка, тряска при ходьбе на движущейся платформе в противоположную движению сторону

(function() {
  class Game {
    constructor() {
      this.canvas = document.getElementById('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.canvasWidth = this.canvas.width = 800;
      this.canvasHeight = this.canvas.height = 700;
      this.animation = null; // requestAnimationFrame
      this.states = {
        walkRight : null,
        walkLeft : null,
        jump : null,
      }; // array of pressed keys
      this.gameFrame = 0; // adjust the player's movement speed
      this.isGaveOver = false;
      this.isGameOverSoundPlayed = false;
      this.scoreValue = 0;
      this.isScoreIncreased = false;
      this.isRestarting = false;
      this.isRestartClicked = false;
      this.isResultsStored = false;
    }

    gameOver() {
      layers.forEach(layer => {
        layer.scrollSpeed = 0;
        layer.speed = layer.scrollSpeed * layer.speedModifier;
      });
      pads.forEach(pad => pad.speed = 0);
      if (!this.isGameOverSoundPlayed) {
        gameOverSound.play();
      };
      this.isGameOverSoundPlayed = true;
      if (!this.isResultsStored) {
        score = this.scoreValue;
        saveInfo();
        this.isResultsStored = true;
      }
      cancelAnimationFrame(this.animation);
    }

    restart() {
      if (this.isRestartClicked) {
        this.isRestarting = true;
        this.isGaveOver = false;
        this.scoreValue = 0;
        this.isGameOverSoundPlayed = false;
        gameOverSound.pause();
      };
    }

    drawGameOverModal() {
      if (this.isGaveOver && !this.isRestarting) {
        this.ctx.drawImage(gameOverModal, 225, 187);
        this.ctx.drawImage(gameOverModalInner, 236, 189);
        this.ctx.drawImage(restartBtn, 331, 423);
        this.ctx.drawImage(menuBtn, 414, 423);
        this.ctx.font = '45px KinderBoys';
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 4;
        this.ctx.strokeText('Your score:', 400, 289);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText('Your score:', 400, 289);
        this.ctx.font = '85px KinderBoys';
        this.ctx.lineWidth = 5;
        this.ctx.strokeText(`${this.scoreValue}`, 400, 354);
        this.ctx.fillText(`${this.scoreValue}`, 400, 354);
      };
    }

    checkCollision(x, y, btnX, btnY, btnWidth, btnHeight) {
      return x >= btnX && x <= btnX + btnWidth && y >= btnY && y <= btnY + btnHeight;
    }

    drawScore() {
      this.ctx.font = '45px KinderBoys';
      this.ctx.textAlign = 'start';
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 4;
      this.ctx.strokeText(`Score: ${this.scoreValue}`, 15, 40);
      this.ctx.fillStyle = '#fff';
      this.ctx.fillText(`Score: ${this.scoreValue}`, 15, 40);
    }
  };

  const game = new Game();

  let jumpSound = new Audio();
  jumpSound.src = 'audio/jump.mp3';
  let stepsSound = new Audio();
  stepsSound.src = 'audio/steps_on_grass.mp3'
  let gameOverSound = new Audio();
  gameOverSound.src = 'audio/whistle_air.mp3';

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

  let gameOverModal = new Image();
  gameOverModal.src = '/gui/bg_small.png';
  let gameOverModalInner = new Image();
  gameOverModalInner.src = '/gui/table_small.png';
  let restartBtn = new Image();
  restartBtn.src = '/gui/restart.png';
  let menuBtn = new Image();
  menuBtn.src = '/gui/menu.png';

  class Layer {
    constructor(image, speedModifier, startLayer = false) {
      this.width = 800;
      this.height = 2076;
      this.startLayer = startLayer; // is a layer a starting one or not (if it is, it should be scrolled only once)
      this.x = 0;
      this.y = -this.height * 2 + game.canvasHeight; // -3452
      this.startLayerY = -this.height * 2 + game.canvasHeight; // -3452
      this.image = image;
      this.scrollSpeed = 0; // adjust the speed of background movement (parallax)
      this.speedModifier = speedModifier; // defines speed for each layer
      this.speed = this.scrollSpeed * this.speedModifier;
      this.isStarted = false; // is background movement started
    }

    // background movement logic
    update() {
      if (!this.startLayer && this.y > -this.height * 2 + game.canvasHeight + this.height) {
        this.y = -this.height * 2 + game.canvasHeight + this.speed * 2;
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
        game.ctx.drawImage(this.image, this.x, this.startLayerY + this.height);
      } else if (!this.startLayer) {
        game.ctx.drawImage(this.image, this.x, this.y);
        game.ctx.drawImage(this.image, this.x, this.y + this.height);
      };
    }

    // if player jumped for the first time, layers begin to scroll
    startScroll() {
      if (player.isJumping && !this.isStarted) {
        this.scrollSpeed = 1;
        this.speed = this.scrollSpeed * this.speedModifier;
        this.isStarted = true;
      };
    }

    // if player jumps high, background movement is accelerating until he goes down again
    speedUp() {
      if (this.isStarted && player.y > 30 && !game.isGaveOver) {
        if (game.scoreValue <= 50) {
          player.jumpLength = 170;
          this.scrollSpeed = 1;
          this.speed = this.scrollSpeed * this.speedModifier;
        };
        if (game.scoreValue <= 100 && game.scoreValue > 50) {
          player.jumpLength = 150;
          this.scrollSpeed = 2;
          this.speed = this.scrollSpeed * this.speedModifier;
        };
        if (game.scoreValue <= 150 && game.scoreValue > 100) {
          player.jumpLength = 130;
          this.scrollSpeed = 3;
          this.speed = this.scrollSpeed * this.speedModifier;
        };
        if (game.scoreValue <= 200 && game.scoreValue > 150) {
          player.jumpLength = 120;
          this.scrollSpeed = 4;
          this.speed = this.scrollSpeed * this.speedModifier;
        };
        if (game.scoreValue > 200) {
          player.jumpLength = 110;
          this.scrollSpeed = 5;
          this.speed = this.scrollSpeed * this.speedModifier;
        };
      } else if (player.y <= 30 && !game.isGaveOver) {
        if (game.scoreValue <= 50) {
          player.jumpLength = 125;
          this.scrollSpeed = 4;
          this.speed = this.scrollSpeed * this.speedModifier;
        };
        if (game.scoreValue <= 100 && game.scoreValue > 50) {
          player.jumpLength = 115;
          this.scrollSpeed = 5;
          this.speed = this.scrollSpeed * this.speedModifier;
        };
        if (game.scoreValue <= 150 && game.scoreValue > 100) {
          player.jumpLength = 105;
          this.scrollSpeed = 6;
          this.speed = this.scrollSpeed * this.speedModifier;
        };
        if (game.scoreValue <= 200 && game.scoreValue > 150) {
          player.jumpLength = 100;
          this.scrollSpeed = 7;
          this.speed = this.scrollSpeed * this.speedModifier;
        };
        if (game.scoreValue > 200) {
          player.jumpLength = 90;
          this.scrollSpeed = 8;
          this.speed = this.scrollSpeed * this.speedModifier;
        }
      }
    }

    restart() {
      if (game.isRestarting) {
        this.x = 0;
        this.y = -this.height * 2 + game.canvasHeight;
        this.startLayerY = -this.height * 2 + game.canvasHeight;
        this.scrollSpeed = 0;
        this.speed = this.scrollSpeed * this.speedModifier;
        this.isStarted = false;
      };
    }

    static updateAll() {
      layers.forEach(layer => layer.update());
      layers.forEach(layer => layer.startScroll());
      layers.forEach(layer => layer.speedUp());
      layers.forEach(layer => layer.restart());
    }

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
      this.speed = 10; // player movement speed
      this.speedX = 2;
      this.isLanded = true; // is player on the ground
      this.isJumping = null;
      this.isFalling = false;
      this.isJumped = false; // is player made one jump
      this.startPoint = 360; // from where player jumps
      this.jumpLength = 170;
      this.isJumpSoundPlayed = false;
    }

    controlStates() {
      if (game.states.jump && this.isLanded && !this.isJumped) {
        this.isJumping = true;
      };
    }

    walkRight() {
      if (game.states.walkRight && !this.isJumping && this.x < game.canvasWidth - this.width - 110) {
        game.isRestarting = false;
        game.isRestartClicked = false;
        if (this.isLanded && !this.isFalling) stepsSound.play()
        else if (!this.isLanded && this.isFalling) stepsSound.pause();
        this.x += this.speed;
        this.frameY = 2;
      
        if (this.frameX < 9) {
          this.frameX++;
        } else {
          this.frameX = 0;
        };
      } else if (this.isJumping || this.x >= game.canvasWidth - this.width - 110) stepsSound.pause();
    }

    walkLeft() {
      if (game.states.walkLeft && !this.isJumping && this.x > 110) {
        game.isRestarting = false;
        game.isRestartClicked = false;
        if (this.isLanded && !this.isFalling) stepsSound.play()
        else if (!this.isLanded && this.isFalling) stepsSound.pause();
        this.x -= this.speed;
        this.frameY = 3;
        
        if (this.frameX < 9) {
          this.frameX++;
        } else {
          this.frameX = 0;
        }
      } else if (this.isJumping || this.x <= 110) stepsSound.pause();
    }

    jump() {
      if (this.isJumping && this.isLanded) {
        game.isRestarting = false;
        game.isRestartClicked = false;
        game.isResultsStored = false;
        this.y -= 20;
        this.isJumpSoundPlayed = false;
        game.isScoreIncreased = false;

        // if player walked to the right before the jump or did not walk before the first jump, he will jump to the right
        if (this.frameY === 2 || 0) {
          this.frameY = 0;
          // if he walked to the left, he will jump to the left
        } else if (this.frameY === 3) {
          this.frameY = 1;
        };

        // if during the jump player turns and moves to the other side
        if (game.states.walkLeft) { 
          this.frameY = 1;
          this.x -= this.speed * 2;
        } else if (game.states.walkRight) {
          this.frameY = 0;
          this.x += this.speed * 2;
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
        if (this.y >= game.canvasHeight) {
          game.gameOver();
          game.isGaveOver = true;
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
          this.isJumping === false &&
          pad.visibility !== 'hidden'
        ) {
          this.y = pad.y - this.height + 30; // + 30px to stand deeper on the pad
          this.startPoint = this.y;
          if (game.states.jump) { // if player landed, but the key Arrow Up is still pressed, player won't jump
            player.isJumped = true;
          };
          if (!this.isJumpSoundPlayed) {
            //setTimeout(() => {
              jumpSound.play();
            //}, 150);
          };
          this.isJumpSoundPlayed = true;
          this.isFalling = false;
          if (!game.isScoreIncreased) {
            game.scoreValue++;
          };
          game.isScoreIncreased = true;
          this.isLanded = true;
          if (this.isLanded && pad.isMoving) {
            if (pad.speedX === 2) {
              this.x += this.speedX;
              if (game.states.walkRight) this.speed = 8;
              if (game.states.walkLeft) this.speed = 14;
            } else if (pad.speedX === -2) {
              this.x -= this.speedX;
              if (game.states.walkLeft) this.speed = 8;
              if (game.states.walkRight) this.speed = 14;
            } else {
              this.speed = 10;
            }
          }
        }
      })
    }

    restart() {
      if (game.isRestarting) {
        this.x = 200;
        this.y = 360;
        this.frameX = 0; // position on the sprite sheet
        this.frameY = 0; // position on the sprite sheet
        this.speed = 10; // player movement speed
        this.speedX = 2;
        this.isLanded = true; // is player on the ground
        this.isJumping = null;
        this.isFalling = false;
        this.isJumped = false; // is player made one jump
        this.startPoint = 360; // from where player jumps
        this.jumpLength = 170;
        this.isJumpSoundPlayed = false;
      }
    }

    updateAll() {
      this.controlStates();
      if (game.gameFrame % 3 == 0) {
        this.walkRight();
        this.walkLeft();
        this.jump();
        this.fall();
      };
      this.land();
      this.restart();
    }

    draw() {
      game.ctx.drawImage(playerImage, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
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
    constructor(index, visibility = 'visible', isMoving = false) {
      this.padCount = 4;
      this.padGap = game.canvasHeight / this.padCount; // 175
      this.height = 70;
      this.width = 210;
      this.speed = 0; // adjust the speed of pads movement
      this.speedX = 2;
      this.isMoving = isMoving;
      this.index = index;
      this.isStarted = false; // is pads movement started
      this.visibility = visibility; // lower pad is invisible until it goes beyond canvas border
      this.y = (this.padGap / 2 - this.height / 2) + this.index * this.padGap; // 46 + i + 175
      this.x = Math.floor(Math.random() * (game.canvasWidth - this.width - 110 - 110 + 1) + 110); // x is random between 110 and 440
    }

    drawPads() {
      if (this.visibility !== 'hidden') {
        game.ctx.drawImage(padImage, this.x, this.y);
      };
    }

    // logic of pads movement
    movePads() {
      this.y += this.speed;
      if (this.y > game.canvasHeight) {
        this.y = -this.padGap;
        this.visibility = 'visible';
      }
    }

    moveHorizontally() {
      if (this.isMoving && !game.isGaveOver) {
        this.x += this.speedX;
        if (this.x >= game.canvasWidth - this.width - 110 || this.x <= 110) {
          this.speedX = -this.speedX;
        };
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
      if (this.isStarted && player.y > 30 && !game.isGaveOver) {
        if (game.scoreValue <= 50) this.speed = 1;
        if (game.scoreValue <= 100 && game.scoreValue > 50) this.speed = 2;
        if (game.scoreValue <= 150 && game.scoreValue > 100) this.speed = 3;
        if (game.scoreValue <= 200 && game.scoreValue > 150) this.speed = 4;
        if (game.scoreValue > 200) this.speed = 5;
      } else if (player.y <= 30 && !game.isGaveOver) {
        if (game.scoreValue <= 50) this.speed = 4;
        if (game.scoreValue <= 100 && game.scoreValue > 50) this.speed = 5;
        if (game.scoreValue <= 150 && game.scoreValue > 100) this.speed = 6;
        if (game.scoreValue <= 200 && game.scoreValue > 150) this.speed = 7;
        if (game.scoreValue > 200) this.speed = 8;
      }
    }

    restart() {
      if (game.isRestarting) {
        this.isStarted = false;
        this.speed = 0;
      };
    }

    static updateAll() {
      pads.forEach(pad => pad.movePads());
      pads.forEach(pad => pad.startScroll());
      pads.forEach(pad => pad.speedUp());
      pads.forEach(pad => pad.moveHorizontally());
      pads.forEach((pad, index) => {
        if (index === 4 && game.isRestarting) {
          pad.visibility = 'hidden';
        };
        if (game.isRestarting) {
          pad.y = (pad.padGap / 2 - pad.height / 2) + pad.index * pad.padGap;
        };
        pad.restart();
      });
    }

    static renderAll() {
      pads.forEach(pad => pad.drawPads());
    }
  }

  const padImage = new Image();
  padImage.src = '/bg/pad.png';

  const pad0 = new Pad(-1); // invisible upper platform for smooth appearance
  const pad1 = new Pad(0);
  const pad2 = new Pad(1, 'visible', true);
  const pad3 = new Pad(2);
  const pad4 = new Pad(3, 'hidden', true);

  const pads = [pad0, pad1, pad2, pad3, pad4];

  class View {
    render() {
      // clear canvas
      game.ctx.clearRect(0, 0, game.canvasWidth, game.canvasHeight);
      // draw all background layers
      Layer.renderAll();
      // draw platforms
      Pad.renderAll();
      // draw player
      player.draw();
      game.drawScore();
      game.drawGameOverModal();
    }
  };

  const view = new View();
  
  class Controller {
    control() {
      function onKeyDownHandler(e) {
        if (game.states.walkRight && e.code === 'ArrowLeft') {
          game.states.walkRight = false;
          game.states.walkLeft = true;
        };
        if (game.states.walkLeft && e.code === 'ArrowRight') {
          game.states.walkLeft = false;
          game.states.walkRight = true;
        };
        if (e.code === 'ArrowRight') game.states.walkRight = true;
        if (e.code === 'ArrowLeft') game.states.walkLeft = true;
        if (e.code === 'ArrowUp') game.states.jump = true;
      };
      function onKeyUpHandler(e) {
        if (e.code === 'ArrowRight') game.states.walkRight = false;
        if (e.code === 'ArrowLeft') game.states.walkLeft = false;
        if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') stepsSound.pause();
        if (e.code === 'ArrowUp') {
          game.states.jump = false;
          player.isJumped = false;
        };
      };
      document.addEventListener('keydown', onKeyDownHandler);
      document.addEventListener('keyup', onKeyUpHandler);
      function onMouseDownHandler(e) {
        if (game.checkCollision(e.offsetX, e.offsetY, 331, 423, 55, 55) && game.isGaveOver) {
          game.isRestartClicked = true;
          game.gameFrame = 0;
          game.canvas.removeEventListener('mousedown', onMouseDownHandler);
          game.canvas.removeEventListener('mousemove', onMouseMoveHandler);
          document.removeEventListener('keydown', onKeyDownHandler);
          document.removeEventListener('keyup', onKeyUpHandler);
          game.canvas.style.cursor = 'default';
          btnClickSound.play();
        };

        if (game.checkCollision(e.offsetX, e.offsetY, 414, 423, 55, 55) && game.isGaveOver) {
          openMain();
          btnClickSound.play();
        };
      };
      function onMouseMoveHandler(e) {
        if (game.checkCollision(e.offsetX, e.offsetY, 331, 423, 55, 55) && game.isGaveOver) {
          game.canvas.style.cursor = 'pointer';
        } else if (!game.checkCollision(e.offsetX, e.offsetY, 331, 423, 55, 55) && game.isGaveOver) {
          game.canvas.style.cursor = 'default';
        } else if (game.checkCollision(e.offsetX, e.offsetY, 331, 423, 55, 55) && !game.isGaveOver) {
          game.canvas.style.cursor = 'default';
        };

        if (game.checkCollision(e.offsetX, e.offsetY, 414, 423, 55, 55) && game.isGaveOver) {
          game.canvas.style.cursor = 'pointer';
        } else if (!game.checkCollision(e.offsetX, e.offsetY, 331, 423, 55, 55) && game.isGaveOver) {
          game.canvas.style.cursor = 'default';
        } else if (game.checkCollision(e.offsetX, e.offsetY, 331, 423, 55, 55) && !game.isGaveOver) {
          game.canvas.style.cursor = 'default';
        };
      };
      if (game.isGaveOver) {
        game.canvas.addEventListener('mousedown', onMouseDownHandler);
        game.canvas.addEventListener('mousemove', onMouseMoveHandler);
      };
    }
  };

  const controller = new Controller();

  class Modal {
    // logic of all changes
    update() {
      Layer.updateAll();
      player.updateAll();
      Pad.updateAll();
      game.restart();
    }

    // main game loop
    animate = () => {
      cancelAnimationFrame(game.animation);
      this.update();
      view.render();
      controller.control();
      game.gameFrame++; // regulate the player's movements speed
      game.animation = requestAnimationFrame(this.animate);
    }
  };

  const modal = new Modal();
  // start of the game
  playerImage.onload = modal.animate();
})();
