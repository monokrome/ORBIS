(function (Phaser) {


const TILE_SIZE = 256;


class GameObject {
  constructor(game, parent) {
    this.game = game;
    this.parent = parent || null;

    this.children = new Set;
    this.classNameToChildrenMap = new Map;

    const tags = new Set(this.getTags());
  }

  // Utility functions useful for most GameObjects
  createGameObject(Kind) { return new Kind(this.game); }

  setupCollision(left, right) {
    if (!left.sprite || !right.sprite) return false;
    return this.game.physics.arcade.collide(left.sprite, right.sprite);
  }

  appendChild(instance) {
    if (!(instance instanceof GameObject)) instance = this.createGameObject(instance);
    this.children.add(instance);

    if (!this.classNameToChildrenMap.has(instance.constructor.name))
      this.classNameToChildrenMap.set(instance.constructor.name, new Set);

    const set = this.classNameToChildrenMap.get(instance.constructor.name);
    if (!set.has(instance)) set.add(instance);
  }

  callChildren(method, ...args) {
    for (const gameObject of this.children) gameObject[method](...args);
  }

  findChildrenByClassName(className, recurse) {
    const results = this.classNameToChildrenMap.get(className) || new Set;
    if (!recurse) return results;

    for (const child of items)
      for (const subChild of child.findChildrenByClassName(className, recurse))
        results.add(subChild);

    return results;
  }

  findChildrenByTagName(tagName, recurse) {
    if (!recurse) return items;

    for (const child of this.children) {
      if (child.tags.has(tagName)) results.append(child);
      if (!recurse) continue;

      for (const subChild of child.findChildrenByTagName(tagName, recurse))
        items.add(subChild);
    }

    return items;
  }

  loadSpriteSheet(name, width, height) {
    this.game.load.spritesheet(
      name, 'assets/' + name + '.png',
      width||TILE_SIZE, height||width||TILE_SIZE
    );
  }

  enablePhysics(subject) {
    this.game.physics.arcade.enable(subject);
    return subject;
  }

  applyGravity(subject) {
    subject.body.gravity.y = 940;
    return subject;
  }

  // Event handlers that can be overriden by your GameObjects
  preload() { this.callChildren('preload'); }

  create() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.callChildren('create');
    this.lastFrameTime = +(new Date);
  }

  preFrameUpdate() { this.callChildren('preFrameUpdate'); }
  frameUpdate() {
    this.currentFrameTime = +(new Date);
    const deltaTime = this.currentFrameTime - this.lastFrameTime;
    this.callChildren('frameUpdate', deltaTime);
    this.lastFrameTime = this.currentFrameTime;
  }
  postFrameUpdate() { this.callChildren('postFrameUpdate'); }
  destroy() { this.callChildren('postFrameUpdate'); }

  // Other functions that GameObjects may want to override
  getTags() { return; }  // Allows organizing of GameObjects by tag names
}


class Companion extends GameObject {
  preload() {
    this.loadSpriteSheet('orb', 128);
    super.preload();
  }

  create() {
      this.sprite = this.enablePhysics(this.game.add.sprite(
        0, this.game.world.height - (TILE_SIZE * 2),
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
    const idealY = this.sprite.body.position.y + (TILE_SIZE * 0.2),
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
      const idealX = this.sprite.body.position.x - (TILE_SIZE * 0.7)

      this.sprite.scale.x = 1.4;

      if (this.sprite.body.position.x < idealX)
        this.sprite.body.velocity.x = accuracy;
      else
        this.sprite.body.velocity.x = 0;

    } else if (this.sprite.body.velocity.x < 0) {
      const idealX = this.sprite.body.position.x + this.sprite.body.width
                     + (TILE_SIZE * 0.7);

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


class PlayerController extends GameObject {
  create() {
    this.cursors = this.game.input.keyboard.createCursorKeys();
    super.create();
  }

  frameUpdate(deltaTime) {
    this.isRequestingJump = this.cursors.up.isDown;

    if (this.cursors.left.isDown && !this.cursors.right.isDown)
      this.xPosition = -1;
    else if (this.cursors.right.isDown && !this.cursors.left.isDown)
      this.xPosition = 1;
    else
      this.xPosition = 0;

    super.frameUpdate(deltaTime);
  }
}

class Player extends GameObject {
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
    this.loadSpriteSheet('vix');
    super.preload();
  }

  create() {
    this.sprite = this.enablePhysics(this.game.add.sprite(
      0, this.game.world.height - (TILE_SIZE * 2),
      'vix'
    ));

    this.applyGravity(this.sprite);
    this.sprite.body.collideWorldBounds = true;

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
    if (this.sprite.body.touching.down
        && this.jumpsRemaining != this.maxJumpsAllowed)
      this.jumpsRemaining = this.maxJumpsAllowed;

    if (!this.jumpsRemaining || !this.controller.isRequestingJump)
      return;

    // TODO: xPosition velocity-based wall jump speed
    if (this.sprite.body.touching.right) this.wallJump(-1);
    else if (this.sprite.body.touching.left) this.wallJump();
    else this.jump();
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
    this.checkJump();
    this.checkMovement();
    super.frameUpdate(deltaTime);
  }
}


class Backdrop extends GameObject {
  preload() {
    this.loadSpriteSheet('environment');
    super.preload();
  }

  create() {
    this.sprite = this.game.add.tileSprite(
      0, 0,
      this.game.world.width, this.game.world.height,
      'environment', 1
    );

    super.create();
  }
}


class World extends GameObject {
  preload() {
    this.loadSpriteSheet('environment');
    super.preload();
  }

  create() {
    this.game.world.chargeRate = 0.04;
    this.sprite = this.game.add.group();
    this.sprite.enableBody = true;

    this.ground = this.enablePhysics(this.game.add.tileSprite(
      0, this.game.world.height - TILE_SIZE,
      this.game.world.width, TILE_SIZE,
      'environment', 9
    ));

    this.ground.body.immovable = true;
    this.sprite.add(this.ground);

    super.create();
  }
}


class ORBIS extends GameObject {
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

}).call(this, Phaser, undefined);
