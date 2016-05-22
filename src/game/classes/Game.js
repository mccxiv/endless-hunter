import Phaser from 'phaser-shim';
import Boot from '../phaser/Boot';
import MainGame from '../phaser/MainGame';

export default class Game extends Phaser.Game {
  constructor(element, state) {
    console.log('is', state);
    super(800, 300, Phaser.AUTO, element);
    this.state.add('Boot', Boot, true);
    this.state.add('MainGame', MainGame);
    this.gameState = state;
  }
}