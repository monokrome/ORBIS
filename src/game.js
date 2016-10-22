class ORBISGame {
  constructor() {
    this.walkRate = 138;
    this.idleAnimation = 'idleRight';

    this.game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
      preload: this.onPreload.bind(this),
      create: this.onCreate.bind(this),
      update: this.onUpdate.bind(this),
    });
  }

  onPreload() {
    this.game.load.spritesheet('vix', 'assets/vix.png', 64, 64);
  }

  onCreate() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.player = this.game.add.sprite(0, this.game.world.height - 150, 'vix');
    this.game.physics.arcade.enable(this.player);

    this.cursors = this.game.input.keyboard.createCursorKeys();

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

    this.player.animations.play(this.idleAnimation);
  }

  updatePlayerState() {
    if (this.cursors.left.isDown && !this.cursors.right.isDown) {
      this.player.body.velocity.x = this.walkRate * -1;
      this.player.animations.play('left');
      this.idleAnimation = 'idleLeft';
    }
    else if (!this.cursors.left.isDown && this.cursors.right.isDown) {
      this.player.body.velocity.x = this.walkRate;
      this.player.animations.play('right');
      this.idleAnimation = 'idleRight';
    }
    else {
      this.player.body.velocity.x = 0;
      this.player.animations.play(this.idleAnimation);
    }

    if (this.player.body.velocity.x > 0 && this.player.body.position.x > this.game.world.width * 0.80) {
      this.player.body.velocity.x = 0;
    }
    else if (this.player.body.velocity.x < 0 && this.player.body.position.x < this.game.world.width / 10) {
      this.player.body.velocity.x = 0;
    }
  }

  onUpdate() {
    this.updatePlayerState();
  }
}


new ORBISGame;
