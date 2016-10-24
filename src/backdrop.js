import GameObject from './game_object';


export default class Backdrop extends GameObject {
  preload() {
    this.MILLISECONDS_IN_ONE_DAY = 86400000;
    this.MILLISECONDS_IN_SIX_HOURS = this.MILLISECONDS_IN_ONE_DAY / 4;
    this.GAME_DAYS_PER_EARTH_DAY = 512;

    this.loadSpriteSheet('environment');
    super.preload();
  }

  getGameTime() {
    return +(new Date) * this.GAME_DAYS_PER_EARTH_DAY;
  }

  create() {
    this.sprite = this.game.add.tileSprite(
      0, 0,
      this.game.world.width, this.game.world.height,
      'environment', 1
    );

    this.rootObject = this.getRootGameObject();

    super.create();
  }

  frameUpdate() {
    const timeUntilEndOfDay = this.getGameTime() % this.MILLISECONDS_IN_ONE_DAY,
          framesLeftInDay = timeUntilEndOfDay / this.MILLISECONDS_IN_SIX_HOURS,
          currentFrame = 3 - parseInt(framesLeftInDay, 10);

    if (this.lastDayNightCycleFrame == currentFrame) return;
    else this.sprite.frame = currentFrame;

    this.lastDayNightCycleFrame = currentFrame;
  }
}
