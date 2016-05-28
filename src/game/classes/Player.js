import Entity from './Entity';
import Items from './Items';

export default class Player extends Entity {
  _equipment;

  constructor({game, world, state}) {
    const tile = world.getLocation('spawn');
    const spriteName = Items.toFilename(state.equipment.armor);
    const level = 10;
    super({tile, spriteName, level, game, world});
    this._equipment = state.equipment;
    this.addWeaponSprite();
  }

  addWeaponSprite() {
    const weapon = Items.toFilename(this._equipment.weapon);
    this._addSprite({name: weapon});
  }
}
