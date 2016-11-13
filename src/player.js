import constants from './constants';

import GameObject from './game_object';
import PlayerController from './player_controller';


export default class Player extends GameObject {
  constructor(...args) {
    super(...args)

    this.idleAnimation = 'idleRight';
    this.currentCharge = 1;
    this.jumpForce = 350;
    this.maxJumpsAllowed = 2;
    this.walkRate = 164;

    this.controller = new PlayerController(...args);
    this.appendChild(this.controller);
  }

  preload() {
    this.game.load.spritesheet(
      'vix', 'assets/tiles/vix.png',
      256, 256,
    );

    super.preload();
  }

  create() {
    this.sprite = this.enablePhysics(this.game.add.sprite(20, 20, 'vix'));

    this.sprite.body.collideWorldBounds = true;
    this.applyGravity(this.sprite);

    this.sprite.scale.set(0.35, 0.35);

    this.sprite.animations.add('idleLeft', [48, 49, 50], 12, true);
    this.sprite.animations.add('idleRight', [32, 33, 34], 12, true);

    this.sprite.animations.add('walkLeft', [
      17, 18, 19, 20,
      21, 22, 23, 24,
    ], 12, true);

    this.sprite.animations.add('walkRight', [
      1, 2, 3, 4,
      5, 6, 7, 8,
    ], 12, true);

    this.sprite.animations.play(this.idleAnimation);

    super.create();
  }

  jump(scalar) {
    scalar = scalar || 1;
    this.sprite.body.velocity.y = (this.jumpForce * -1) * scalar;
    this.jumpsRemaining--;
    this.lastJumpTime = this.currentFrameTime;
  }

  wallJump(scalar) {
    scalar = scalar || 1;
    this.sprite.body.velocity.x = (this.jumpForce * 10.6) * scalar;
    this.jump(0.2);
    this.jumpsRemaining = 0;
  }

  checkJump() {
    if (this.sprite.body.touching.down)
      this.jumpsRemaining = this.maxJumpsAllowed;

    if (!this.jumpsRemaining || !this.controller.isRequestingJump) return;

    // TODO: xPosition velocity-based wall jump speed
    if (this.sprite.body.touching.right && this.controller.xPosition > 0)
      this.wallJump(-1);
    else if (this.sprite.body.touching.left && this.controller.xPosition < 0)
      this.wallJump();
    else
      this.jump();
  }

  checkOnGroundMovement() {
    this.sprite.body.velocity.x = this.walkRate * this.controller.xPosition;

    if (this.controller.xPosition < 0) {
      this.sprite.animations.play('walkLeft');
      this.idleAnimation = 'idleLeft';
    }
    else if (this.controller.xPosition > 0) {
      this.sprite.animations.play('walkRight');
      this.idleAnimation = 'idleRight';
    } else {
      this.sprite.animations.play(this.idleAnimation);
    }
  }

  checkInAirMovement() {
    this.sprite.animations.play(this.idleAnimation);
    if (this.sprite.body.velocity.x != 0) this.sprite.body.velocity.x *= 0.986;
  }

  checkMovement() {
    if (this.sprite.body.touching.down)  this.checkOnGroundMovement();
    else this.checkInAirMovement();
  }

  frameUpdate(deltaTime) {
    this.checkMovement();
    this.checkJump();
    super.frameUpdate(deltaTime);
  }
}
