import GameObject from './game_object';
import World from './world';
import Player from './player';
import Backdrop from './backdrop';


export default class ORBIS extends GameObject {
  constructor() {
    super()

    this.game = new Phaser.Game(1024, 768, Phaser.AUTO, '', {
      preload: this.preload.bind(this),
      create: this.create.bind(this),
      update: this.frameUpdate.bind(this),
    });

    [Backdrop, World, Player].map(this.appendChild.bind(this));
  }

  create() {
    super.create();

    const players = this.findChildrenByClassName('Player'),
          worlds = this.findChildrenByClassName('World');

    // Get the Player and World
    for (const player of players) for (const world of worlds) {
      this.player = player;
      this.world = world;
    }
  }

  frameUpdate() {
    // The game is a special case where we don't have deltaTime yet, because
    // it is the root object which calculates the deltaTime for us.
    this.currentFrameTime = +(new Date);

    this.setupCollision(this.player, this.world);

    this.callChildren('frameUpdate', this.currentFrameTime-this.lastFrameTime);
    this.lastFrameTime = this.currentFrameTime;
  }
}


this.game = new ORBIS();
