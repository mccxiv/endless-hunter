import game from './game';
import EasyStar from 'exports?EasyStar.js!easystarjs';

class World {
  constructor() {
    this.tilemap = null;
    this.collisionLayer = null;
    this.walkableGrid = null;
    this.tileSize = null;
    this.game = game();

    this._makeTilemapLayers();
    this._setWorldBounds();
    this._setTileSize();
    this._setWalkableGrid();
  }

  pathTo({x: fromX, y: fromY}, {x: toX, y: toY}) {
    let path;
    const astar = new EasyStar();
    astar.enableSync();
    astar.setAcceptableTiles(0);
    astar.setGrid(this.walkableGrid);
    astar.findPath(fromX, fromY, toX, toY, (p) => path = p);
    astar.calculate();
    if (path) path.shift();
    return path && path.length? path : null;
  }

  toTile({x, y}) {
    const c = (coord) => this.game.math.snapToFloor(coord / this.tileSize, 1);
    return {x: c(x), y: c(y)};
  }

  toPixel(coords) {
    const toPixel = (coord) => coord * this.tileSize + this.tileSize / 2;
    return {x: toPixel(coords.x), y: toPixel(coords.y)};
  }

  _setTileSize() {
    this.tileSize = this.tilemap.getTile(0, 0).height;
  }
  
  _setWalkableGrid() {
    const width = this.tilemap.widthInPixels;
    const height = this.tilemap.heightInPixels;
    const tiles = this.collisionLayer.getTiles(0, 0, width, height);
    this.walkableGrid = tiles.reduce((arr, tile) => {
      // EasyStar is weird and wants the grid reversed...
      if (!arr[tile.y]) arr[tile.y] = [];
      arr[tile.y][tile.x] = tile.index > -1? 1 : 0;
      return arr;
    }, []);
  }

  _makeTilemapLayers() {
    this.tilemap = this.game.add.tilemap('world');
    this.tilemap.addTilesetImage('tilesheet', 'gameTiles');
    this.tilemap.layers
      .filter(l => l.name !== 'collision')
      .forEach((l) => this.tilemap.createLayer(l.name));
    this.collisionLayer = this.tilemap.createLayer('collision');
    this.collisionLayer.visible = false;
  }

  _setWorldBounds() {
    const {widthInPixels: w, heightInPixels: h} = this.tilemap;
    this.game.world.setBounds(0, 0, w, h);
  }
}

let worldInstance;

export default () => {
  if (!worldInstance) worldInstance = new World();
  return worldInstance;
}
