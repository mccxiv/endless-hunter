import Entity from './Entity';

export default class Player extends Entity {
  constructor({game, world}) {
    const tile = world.getLocation('spawn');
    const spriteName = 'platearmor';
    const level = 10;
    super({tile, spriteName, level, game, world});
    this.addWeaponSprite();
  }

  addWeaponSprite() {
    this._addSprite({name: 'axe'});
  }
}
