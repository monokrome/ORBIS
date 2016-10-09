/***
 * I'M LEARNING PIXI, YALL!!!
 *              <3 Bailey
 ***/
(function (PIXI, document, undefined) {


  const VERSION = '0.0.1-prealpha',

        TILE_SIZE = 128,
        TILE_SCALE = 1,

        X_SIZE = 6 * TILE_SIZE * TILE_SCALE,
        Y_SIZE = 4 * TILE_SIZE * TILE_SCALE,

        TILESET_RESOURCE_NAME = 'tileset',
        TILEMAP_RESOURCE_NAME = 'tilemap',

        debugEnabled = window.location.search.indexOf('debug') > -1,
        verboseEnabled = window.location.search.indexOf('verbose') > -1;


  function debug(message, verbose) {
    if (!debugEnabled) return;
    if (verbose && !verboseEnabled) return;
    console.log(message);
  }


  class TileSet {
    constructor(resource, map) {
      this.texture = resource.texture;
      this.map = map.data;

      this.textureMap = {};
    }

    createTexture(x, y) {
      // Reuse a texture if it has already been created.
      if (this.textureMap[x] && this.textureMap[x][y])
          return this.textureMap[x][y].texture;

      const texture = new PIXI.Texture(this.texture, new PIXI.Rectangle(
        (x * TILE_SIZE), y * TILE_SIZE,
        TILE_SIZE, TILE_SIZE
      ));

      this.textureMap[x] = this.textureMap[x] || {};
      this.textureMap[x][y] = {texture: texture};
      return texture;
    }
  }


  class TileBasedGame {
    constructor(rootElement, tileSet) {
      debug('Game has been created.');

      this.root = rootElement;
      this.tileSetName = tileSet || './assets/Tiles';

      // Initialize PIXI rendering
      // this.renderer = new PIXI.autoDetectRenderer(X_SIZE, Y_SIZE);
      this.renderer = new PIXI.CanvasRenderer(X_SIZE, Y_SIZE);
      this.stage = new PIXI.Container;

      // Things to be set later.
      this.texture = null;
    }

    start() {
      debug('Starting game.');
      this.root.appendChild(this.renderer.view);
      this.loadTileSet();
    }

    loadTileSet() {
      debug('Loading tileset.');

      PIXI.loader
        .add(TILESET_RESOURCE_NAME, this.tileSetName + '.png')
        .add(TILEMAP_RESOURCE_NAME, this.tileSetName + '.json')
        .load(this.onTilesLoaded.bind(this));
    }

    onTilesLoaded(loader, resources) {
      debug('Tileset loaded. Setting up textures.');

      const tileSet = resources[TILESET_RESOURCE_NAME],
            tileMap = resources[TILEMAP_RESOURCE_NAME],
            tiles = {};

      this.loader = loader;
      this.resources = resources;
      this.tileSet = new TileSet(tileSet, tileMap);
      this.initializeGameState();
      this.firstFrame();
    }

    firstFrame() {
      debug('Entering game main loop.');
      this.lastRenderTime = +(new Date) / 1000;
      this.incrementFrame();
    }

    incrementFrame() {
      const currentTime = +(new Date) / 1000;
      this.frameUpdate(currentTime - this.lastRenderTime);
      this.lastRenderTime = currentTime;
      this.renderer.render(this.stage);
      requestAnimationFrame(this.incrementFrame.bind(this));
    }
  }

  class ORBISGame extends TileBasedGame {
    getSpriteFilters() { return []; }

    createEntity(x, y, SpriteClass) {
      SpriteClass = SpriteClass || PIXI.extras.TilingSprite;

      const texture = this.tileSet.createTexture(x, y),
            entity = new SpriteClass(texture);

      entity.filters = this.getSpriteFilters();

      entity.position.x = entity.position.y = 0;
      entity.scale.x = entity.scale.y = TILE_SCALE;
      entity.width = TILE_SIZE;
      entity.height = TILE_SIZE;

      return entity;
    }

    createSky() {
      const entity = this.createEntity(6, 2, PIXI.extras.TilingSprite);
      entity.scale.x = entity.scale.y = TILE_SCALE;
      entity.width = X_SIZE;
      entity.height = Y_SIZE;
      return entity;
    }

    createCityScape() {
      const entity = this.createEntity(1, 2);
      entity.position.y = Y_SIZE - (TILE_SIZE * TILE_SCALE);
      entity.width = X_SIZE;
      return entity;
    }

    initializeGameState() {
      debug('Initializing game state.');

      this.sky = this.createSky(this.sky);
      this.stage.addChild(this.sky);
      this.cityScape = this.createCityScape();
      this.stage.addChild(this.cityScape);
    }

    frameUpdate(deltaTime) {
      this.sky.tilePosition.x += 0.5 * deltaTime;
      this.sky.tilePosition.y += 0.3 * deltaTime;
      this.cityScape.height = TILE_SIZE;
    }
  }

  debug('Using ORBIS v' + VERSION);
  document.addEventListener('DOMContentLoaded', function() {
    debug('Creating ORBIS Game');
    (new ORBISGame(document.body)).start();
  }, false);



}).call(window, window.PIXI, document);
