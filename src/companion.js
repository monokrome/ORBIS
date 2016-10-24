import constants from './constants';

import GameObject from './game_object';


export default class Companion extends GameObject {
  preload() {
    this.loadSpriteSheet('orb', 128);
    super.preload();
  }

  create() {
      this.sprite = this.enablePhysics(this.game.add.sprite(
        0, this.game.world.height - (constants.TILE_SIZE * 2),
        'orb'
      ));

      Object.assign(this.sprite.data, {
        maxSpeed: 300,
        thrustAccuracy: 0.1,
      });

      this.sprite.anchor.y = this.sprite.anchor.x = 0.56;
      this.sprite.scale.setTo(1.4);

      this.sprite.animations.add('idle', [1,2], 2, true);
      this.sprite.animations.add('turning', [5,6,7,8], 8, true);
      this.sprite.animations.play('idle');
      super.create();
  }

  frameUpdate(deltaTime) {
    const idealY = this.sprite.body.position.y + (constants.TILE_SIZE * 0.2),
          accuracy = this.maxSpeed - (
            Math.sin(this.currentFrameTime * 0.5)
            * this.thrustAccuracy
            * this.maxSpeed
          );

    if (this.sprite.position.y > idealY) {
      this.sprite.body.velocity.y = accuracy * 0.2;
    } else if (this.sprite.position.y < idealY) {
      this.sprite.body.velocity.y = accuracy * 0.2 * -1;
    } else {
      this.sprite.body.velocity.y = 0;
    }

    this.sprite.body.velocity.y = ((accuracy) - this.maxSpeed);

    if (this.sprite.body.velocity.x > 0) {
      const idealX = this.sprite.body.position.x - (constants.TILE_SIZE * 0.7)

      this.sprite.scale.x = 1.4;

      if (this.sprite.body.position.x < idealX)
        this.sprite.body.velocity.x = accuracy;
      else
        this.sprite.body.velocity.x = 0;

    } else if (this.sprite.body.velocity.x < 0) {
      const idealX = this.sprite.body.position.x + this.sprite.body.width
                     + (constants.TILE_SIZE * 0.7);

      this.sprite.scale.x = -1.4;

      if (this.sprite.body.position.x > idealX)
        this.sprite.body.velocity.x = accuracy * -1;
      else
        this.sprite.body.velocity.x = 0;
    } else {
      this.sprite.body.velocity.x = 0;
    }

    super.frameUpdate(deltaTime);
  }
}
