import Game from './game/classes/Game';
import Ui from './ui/ui';
import createState from './game/objects/state';

export default class EndlessHunter {
  constructor({el, state}) {
    this.elements = {game: null, ui: null};
    this.state = state || createState();
    this.prepDom(el);
    this.game = new Game(this.elements.game, this.state);
    this.ui = new Ui(this.elements.ui, this.state);
  }

  prepDom(el) {
    if (typeof el === 'string') el = document.querySelector(el);
    this.elements.game = document.createElement('div');
    this.elements.ui = document.createElement('div');
    el.appendChild(this.elements.game);
    el.appendChild(this.elements.ui);
  }
}