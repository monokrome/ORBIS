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
    this.player.body.gravity.y = 300;
    this.player.body.collideWorldBounds = true;

    Object.assign(this.player.data, {
      currentCharge: 1,
      idleAnimation: 'idleRight',
      jumpForce: 20,
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
  }

  jump() {
    console.dir('Hi.');
  }

  updatePlayerState() {
    const hitPlatform = this.game.physics.arcade.collide(this.player, this.platforms);

    if (hitPlatform && this.cursors.up.isDown) this.jump();

    if (this.cursors.left.isDown && !this.cursors.right.isDown) {
      this.player.body.velocity.x = this.player.data.walkRate * -1;
      this.player.animations.play('left');
      this.player.data.idleAnimation = 'idleLeft';

    } else if (!this.cursors.left.isDown && this.cursors.right.isDown) {
      this.player.body.velocity.x = this.player.data.walkRate;
      this.player.animations.play('right');
      this.player.data.idleAnimation = 'idleRight';

    } else {
      this.player.body.velocity.x = 0;
      this.player.animations.play(this.player.data.idleAnimation);
    }
  }

  onUpdate() {
    this.updatePlayerState();
  }
}


this.game = new ORBISGame;


})(undefined);
