import Phaser from 'phaser-shim';
import monsters from '../assets/monsters/monsters.yaml';
import Items from '../classes/Items';

const load = require.context('../assets/', true, /.*/);

export default class Boot extends Phaser.State {
  preload() {
    this.loadWorldAssets();
    this.loadSprites();
    this.disablePauseWhenUnfocused();
    this.enablePixelRounding();
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

  enablePixelRounding() {
    this.game.renderer.renderSession.roundPixels = true;
  }

  loadSprites() {
    const monsterNames = Object.keys(monsters);
    const weapons = Items.weapons.map(Items.toFilename);
    const armor = Items.armor.map(Items.toFilename);
    [...monsterNames, ...weapons, ...armor].forEach((sprite) => {
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