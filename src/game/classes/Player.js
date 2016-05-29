import Entity from './Entity';
import Items from './Items';

export default class Player extends Entity {
  _equipment;
  _state;

  constructor({game, world, state}) {
    const tile = world.getLocation('spawn');
    const spriteName = Items.toFilename(state.equipment.armor);
    super({tile, spriteName, level: 10, game, world});
    this._state = state;
    this._equipment = state.equipment;
    this._addWeaponSprite();
    this._keepHealthinessUpdated();
    this._useEnergyWhenStriking();
    this._getExpWhenStriking();
  }

  _addWeaponSprite() {
    const weapon = Items.toFilename(this._equipment.weapon);
    this._addSprite({name: weapon});
  }

  _keepHealthinessUpdated() {
    this.events.on('hp', hp => {
      this._state.healthiness = Math.round(hp / this.getMaxHp() * 100);
    });
  }

  _useEnergyWhenStriking() {
    this.events.on('strike', () => this._state.energy--);
  }

  _getExpWhenStriking() {
    this.events.on('strike', () => this._state.experience.combat++);
  }
}
