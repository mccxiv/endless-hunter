import Game from './game/classes/Game';
import Ui from './ui/ui';
import createState from './game/objects/state';

export default class EndlessHunter {
  constructor({el, state}) {
    this._state = state || createState();
    this._elements = {game: null, ui: null};
    this._prepDom(el);
    this._game = new Game(this._elements.game, this._state);
    this._ui = new Ui(this._elements.ui, this._state);
  }

  _prepDom(el) {
    if (typeof el === 'string') el = document.querySelector(el);
    this._elements.game = document.createElement('div');
    this._elements.ui = document.createElement('div');
    el.appendChild(this._elements.game);
    el.appendChild(this._elements.ui);
  }

  get state() {return this._state}
  get events() {return this._game.events}
}