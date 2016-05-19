import Phaser from 'phaser-shim';
import Boot from '../phaser/Boot';
import MainGame from '../phaser/MainGame';

let instance;

export default class Game extends Phaser.Game {
  constructor(element) {
    if (instance) throw Error('Trying to instantiate game twice.');
    super(800, 300, Phaser.AUTO, element);
    this.state.add('Boot', Boot, true);
    this.state.add('MainGame', MainGame);
    instance = this;
  }
  
  static get instance() {
    return instance;
  }
}