import Phaser from 'phaser-shim';

const sprites = ['rat', 'platearmor'];
const load = require.context('../assets', true, /.*/);

export default class Boot extends Phaser.State {
  preload() {
    this.loadWorldAssets();
    this.loadSprites();
    this.disablePauseWhenUnfocused();
  }

  create() {this.game.state.start('MainGame')}

  image(src) {
    const img = new Image();
    img.src = src;
    return img;
  }

  loadWorldAssets() {
    const map = load('./map/map.json');
    const tilesheetUri = load('./map/tilesheet.png');
    this.cache.addTilemap('world', null, map, Phaser.Tilemap.TILED_JSON);
    this.cache.addImage('gameTiles', null, this.image(tilesheetUri));
  }

  loadSprites() {
    sprites.forEach((sprite) => {
      const data = load(`./sprites/data/${sprite}.yaml`);
      const imageUri = load(`./sprites/img/${sprite}.png`);
      const image = this.image(imageUri);
      this.cache.addJSON(sprite, null, data);
      this.cache.addSpriteSheet(sprite, null, image, data.width, data.height);
    });
  }

  disablePauseWhenUnfocused() {
    this.stage.disableVisibilityChange = true;
  }
}