import Phaser from 'phaser-shim';
import Boot from '../phaser/Boot';
import MainGame from '../phaser/MainGame';

class Game extends Phaser.Game {
  constructor(element) {
    super(800, 300, Phaser.AUTO, element);
    this.state.add('Boot', Boot, true);
    this.state.add('MainGame', MainGame);
  }
}

let gameInstance;

export default (element) => {
  if (!gameInstance) gameInstance = new Game(element);
  return gameInstance;
}