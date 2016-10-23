(function (Phaser) {


const TILE_SIZE = 256;


class ORBISGame {
  constructor() {
    this.game = new Phaser.Game(1024, 768, Phaser.AUTO, '', {
      preload: this.onPreload.bind(this),
      create: this.onCreate.bind(this),
      update: this.onUpdate.bind(this),
    });

    // Phaser docs are messy. What is the right way to do this?...
    this.game.path = Phaser.Math;
  }

  enableFullScreen() {
    this.game.stage.scale.startFullScreen();
  }

  loadSpriteSheet(name, width, height) {
    this.game.load.spritesheet(
      name, 'assets/' + name + '.png',
      width||TILE_SIZE, height||width||TILE_SIZE
    );
  }

  onPreload() {
    this.loadSpriteSheet('vix');
    this.loadSpriteSheet('environment');
    this.loadSpriteSheet('orb', 128);
  }

  enablePhysics(subject) {
    this.game.physics.arcade.enable(subject);
    return subject;
  }

  applyGravity(subject) {
    subject.body.gravity.y = 940;
  }

  createWorld() {
    this.game.world.chargeRate = 0.04;

    this.background = this.game.add.group();
    this.sky = this.game.add.tileSprite(
      0, 0,
      this.game.world.width, this.game.world.height,
      'environment', 1
    );
    this.background.add(this.sky);

    this.platforms = this.game.add.group();
    this.platforms.enableBody = true;
    this.ground = this.enablePhysics(this.game.add.tileSprite(
      0, this.game.world.height - TILE_SIZE,
      this.game.world.width, TILE_SIZE,
      'environment', 9
    ));
    this.ground.body.immovable = true;
    this.platforms.add(this.ground);
  }

  createCompanion() {
    this.companion = this.enablePhysics(this.game.add.sprite(
      0, this.game.world.height - (TILE_SIZE * 2),
      'orb'
    ));

    Object.assign(this.companion.data, {
      maxSpeed: 300,
      thrustAccuracy: 0.1,
    });

    this.companion.anchor.y = this.companion.anchor.x = 0.56;
    this.companion.scale.setTo(1.4);

    this.companion.animations.add('idle', [1,2], 2, true);
    this.companion.animations.add('turning', [5,6,7,8], 8, true);
    this.companion.animations.play('idle');
  }

  createPlayer() {
    this.player = this.enablePhysics(this.game.add.sprite(
      0, this.game.world.height - (TILE_SIZE * 2),
      'vix'
    ));

    Object.assign(this.player.data, {
      currentCharge: 1,
      idleAnimation: 'idleRight',
      jumpForce: 350,
      maxJumpsAllowed: 2,
      walkRate: 164,
    });

    this.applyGravity(this.player);
    this.player.body.collideWorldBounds = true;

    this.player.animations.add('idleLeft', [48, 49, 50], 12, true);
    this.player.animations.add('idleRight', [32, 33, 34], 12, true);

    this.player.animations.add('walkLeft', [
      17, 18, 19, 20,
      21, 22, 23, 24,
    ], 12, true);

    this.player.animations.add('walkRight', [
      1, 2, 3, 4,
      5, 6, 7, 8,
    ], 12, true);

    this.player.animations.play(this.player.data.idleAnimation);
  }

  onCreate() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.cursors = this.game.input.keyboard.createCursorKeys();

    this.createWorld();
    this.createPlayer();
    this.createCompanion();

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

    if (this.player.body.touching.right) this.wallJump(-1);
    else if (this.player.body.touching.left) this.wallJump();
    else if (this.cursors.up.isDown) this.jump();
  }

  checkMovement() {
    const isInAir = !this.player.body.touching.down;

    if (this.cursors.left.isDown && !this.cursors.right.isDown) {
      this.player.body.velocity.x = this.player.data.walkRate * -1;
      this.player.animations.play('walkLeft');
      this.player.data.idleAnimation = 'idleLeft';
    } else if (!this.cursors.left.isDown && this.cursors.right.isDown) {
      this.player.body.velocity.x = this.player.data.walkRate;
      this.player.animations.play('walkRight');
      this.player.data.idleAnimation = 'idleRight';
    } else if (!isInAir) {
      this.player.body.velocity.x = 0;
      this.player.animations.play(this.player.data.idleAnimation);
    }

    if (isInAir && this.player.body.velocity.x != 0)
      this.player.body.velocity.x *= 0.8;
  }

  updateWorldState(deltaTime) {}

  updatePlayerCompanionState() {
    const idealY = this.player.body.position.y + (TILE_SIZE * 0.2),
          accuracy = this.companion.data.maxSpeed - (
            Math.sin(this.currentFrameTime * 0.5)
            * this.companion.data.thrustAccuracy
            * this.companion.data.maxSpeed
          );

    if (this.companion.position.y > idealY) {
      this.companion.body.velocity.y = accuracy * 0.2;
    } else if (this.companion.position.y < idealY) {
      this.companion.body.velocity.y = accuracy * 0.2 * -1;
    } else {
      this.companion.body.velocity.y = 0;
    }

    this.companion.body.velocity.y = ((accuracy) - this.companion.data.maxSpeed);

    if (this.player.body.velocity.x > 0) {
      const idealX = this.player.body.position.x - (TILE_SIZE * 0.7)

      this.companion.scale.x = 1.4;

      if (this.companion.body.position.x < idealX)
        this.companion.body.velocity.x = accuracy;
      else
        this.companion.body.velocity.x = 0;

    } else if (this.player.body.velocity.x < 0) {
      const idealX = this.player.body.position.x + this.player.body.width
                     + (TILE_SIZE * 0.7);

      this.companion.scale.x = -1.4;

      if (this.companion.body.position.x > idealX)
        this.companion.body.velocity.x = accuracy * -1;
      else
        this.companion.body.velocity.x = 0;
    } else {
      this.companion.body.velocity.x = 0;
    }
  }

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
    this.updatePlayerCompanionState(deltaTime);
    this.lastFrameTime = this.currentFrameTime;
  }
}


this.game = new ORBISGame;


}).call(this, Phaser, undefined);
