import constants from './constants';


export default class GameObject {
  constructor(game, parent) {
    this.game = game || this.createGame();
    this.parent = parent || null;

    this.children = new Set;
    this.classNameToChildrenMap = new Map;

    const tags = new Set(this.getTags());
  }

  createGame() {
    return new Phaser.Game(1024, 768, Phaser.AUTO, '', {
      preload: this.preload.bind(this),
      create: this.create.bind(this),
      update: this.frameUpdate.bind(this),
    });
  }

  // Utility functions useful for most GameObjects
  createGameObject(Kind) {
    return new Kind(this.game, this);
  }

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

    return instance;
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

  getRootGameObject() {
    if (this.parent) return this.parent.getRootGameObject();
    return this;
  }

  loadLevel(name) {
  }

  loadImage(name) {
    this.game.load.image(name, 'assets/Tilesets/' + name + '.png');
  }

  loadSpriteSheet(name, width, height) {
    this.game.load.spritesheet(
      name, 'assets/Tilesets/' + name + '.png',
      width||constants.TILE_SIZE, height||width||constants.TILE_SIZE
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
