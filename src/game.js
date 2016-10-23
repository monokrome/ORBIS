(function () {


class ORBISGame {
  constructor() {
    this.game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
      preload: this.onPreload.bind(this),
      create: this.onCreate.bind(this),
      update: this.onUpdate.bind(this),
    });
  }

  onPreload() {
    this.game.load.spritesheet('vix', 'assets/vix.png', 64, 64);
  }

  createWorld() {
    this.game.world.chargeRate = 0.04;

    this.platforms = this.game.add.group();
    this.platforms.enableBody = true;

    this.ground = this.platforms.create(0, this.game.world.height - 32, 'ground');
    this.ground.height = 32;
    this.ground.width = this.game.world.width;

    this.ground.body.immovable = true;
  }

  createPlayer() {
    this.player = this.game.add.sprite(0, this.game.world.height - 150, 'vix');

    this.game.physics.arcade.enable(this.player);
    this.player.body.gravity.y = 940;
    this.player.body.collideWorldBounds = true;

    Object.assign(this.player.data, {
      currentCharge: 1,
      idleAnimation: 'idleRight',
      jumpForce: 350,
      maxJumpsAllowed: 2,
      walkRate: 138,
    });

    this.player.animations.add('idleRight', [39], 12, true);
    this.player.animations.add('idleLeft', [13], 12, true);

    this.player.animations.add('left', [
      117, 118, 119, 120,
      121, 122, 123, 124,
    ], 12, true);

    this.player.animations.add('right', [
      143, 144, 145, 146,
      147, 148, 149, 150,
    ], 12, true);

    this.player.animations.play(this.player.data.idleAnimation);
  }

  onCreate() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.cursors = this.game.input.keyboard.createCursorKeys();

    this.createWorld();
    this.createPlayer();

    this.lastFrameTime = +(new Date);
  }

  jump(scalar) {
    scalar = scalar || 1;
    this.player.body.velocity.y = (this.player.data.jumpForce * -1) * scalar;
    this.player.data.jumpsRemaining--;
    this.lastJumpTime = this.currentFrameTime;
    this.player.data.jumpPressed = true;
  }

  wallJump(scalar) {
    scalar = scalar || 1;
    this.player.body.velocity.x = (this.player.data.jumpForce * 10.6) * scalar;
    this.jump(0.2);
    this.player.data.jumpsRemaining = 0;
  }

  checkJump() {
    if (this.player.data.jumpPressed && (!this.cursors.up.isDown || (
          (this.currentFrameTime - this.lastJumpTime) < 1500))
        ) {
      this.player.data.jumpPressed = false;
    }

    if (this.player.body.touching.down && this.player.data.jumpsRemaining != this.player.data.maxJumpsAllowed)
      this.player.data.jumpsRemaining = this.player.data.maxJumpsAllowed;

    if (!this.player.data.jumpsRemaining || this.player.data.jumpPressed) return;
    console.dir('Reset');

    if (this.player.body.touching.right) this.wallJump(-1);
    else if (this.player.body.touching.left) this.wallJump();
    else if (this.cursors.up.isDown) this.jump();
  }

  checkMovement() {
    const isInAir = !this.player.body.touching.down;

    if (this.cursors.left.isDown && !this.cursors.right.isDown) {
      this.player.body.velocity.x = this.player.data.walkRate * -1;
      this.player.animations.play('left');
      this.player.data.idleAnimation = 'idleLeft';
    } else if (!this.cursors.left.isDown && this.cursors.right.isDown) {
      this.player.body.velocity.x = this.player.data.walkRate;
      this.player.animations.play('right');
      this.player.data.idleAnimation = 'idleRight';
    } else if (!isInAir) {
      this.player.body.velocity.x = 0;
      this.player.animations.play(this.player.data.idleAnimation);
    }

    if (isInAir && this.player.body.velocity.x != 0)
      this.player.body.velocity.x *= 0.8;
  }

  updateWorldState(deltaTime) {}

  updatePlayerState(deltaTime) {
    this.game.physics.arcade.collide(this.player, this.platforms);
    this.checkMovement();
    this.checkJump();
  }

  onUpdate() {
    this.currentFrameTime = +(new Date);
    const deltaTime = this.currentFrameTime - this.lastFrameTime;

    this.updateWorldState(deltaTime);
    this.updatePlayerState(deltaTime);
    this.lastFrameTime = this.currentFrameTime;
  }
}


this.game = new ORBISGame;


})(undefined);
