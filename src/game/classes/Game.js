import Phaser from 'phaser-shim';
import Boot from '../phaser/Boot';
import MainGame from '../phaser/MainGame';
import {EventEmitter} from 'events';

export default class Game extends Phaser.Game {
  constructor(element, state) {
    super(800, 300, Phaser.AUTO, element);
    this.state.add('Boot', Boot, true);
    this.state.add('MainGame', MainGame);
    this.gameState = state;
    this.events = new EventEmitter();
  }
}