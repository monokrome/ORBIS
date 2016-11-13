import constants from './constants';
import GameObject from "./game_object";
import Player from './player';



export default class Universe extends GameObject {
  constructor(...args) {
      super(...args);
      this.player = this.appendChild(Player);
  }

  preload() {
    const tilemap = this.game.load.tilemap(
      'world', 'assets/levels/world/world.json',
      null, Phaser.Tilemap.TILED_JSON,
    );

    this.game.load.image('environment', 'assets/tiles/environment.png');

    super.preload();
  }

  create() {
    this.level = this.game.add.tilemap('world', 32, 32, 32, 28);
    this.level.addTilesetImage('environment', 'environment');
    this.level.createLayer('Scenery');

    const platforms = this.level.createLayer('Platforms'),
          playerStart = this.getEntityByType('PlayerStart');

    super.create();

    this.player.sprite.body.position.x = playerStart.x;
    this.player.sprite.body.position.y = playerStart.y;

    this.game.physics.enable(this.level);

    this.level.setCollisionBetween(1, 2000);

    return this.game.physics.arcade.collide(
      this.player.sprite,
      platforms,
    );
  }

  frameUpdate() {
    this.currentFrameTime = +(new Date);
    this.callChildren('frameUpdate', this.currentFrameTime-this.lastFrameTime);
    this.lastFrameTime = this.currentFrameTime;
    this.game.camera.x -= 1;
  }

  // Utility functions for finding objects in the universe
  findEntitiesBy(property, value, limit) {
    const results = [];
    for (const entity of this.level.objects.Entities) {
      if (entity[property] == value) {
        results.push(entity);
        if (results.length == limit) break;
      }
    }
    return results;
  }

  findEntityBy(property, value) {
    const results = this.findEntitiesBy(property, value, 1);
    if (!results.length) return null;
    return results[0];
  }

  getEntitiesByName(name) { return this.findEntitiesBy('name', name); }
  getEntityByName(name) { return this.findEntityBy('name', name); }

  getEntitiesByType(type) { return this.findEntitiesBy('type', type); }
  getEntityByType(type) { return this.findEntityBy('type', type); }
}
