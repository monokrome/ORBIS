import constants from './constants';

import GameObject from "./game_object";


export default class World extends GameObject {
  preload() {
    this.loadSpriteSheet('environment');
    super.preload();
  }

  create() {
    this.game.world.chargeRate = 0.04;
    this.sprite = this.game.add.group();
    this.sprite.enableBody = true;

    this.ground = this.enablePhysics(this.game.add.tileSprite(
      0, this.game.world.height - constants.TILE_SIZE,
      this.game.world.width, constants.TILE_SIZE,
      'environment', 9
    ));

    this.ground.body.immovable = true;
    this.sprite.add(this.ground);

    super.create();
  }
}
