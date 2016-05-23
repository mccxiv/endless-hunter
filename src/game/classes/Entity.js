import sleep from 'sleep-promise';
import EventEmitter from 'events';

export default class Entity {
  constructor({tile: {x, y}, spriteName, level, game, world}) {
    this.game = game;
    this.world = world;
    this.events = new EventEmitter();
    this.state = {
      sprite: null,
      path: [],
      moving: false,
      facing: null,
      hp: level * 10,
      target: null
    };
    this._makeSprite(world.toPixel({x, y}), spriteName);
  }

  clearTarget() {
    this.state.target = null;
  }
  
  goTo({x, y}) {
    const from = this.getTile();
    const path = this.world.pathTo(from, {x, y});
    if (!path) return;
    this.state.path = path;
    if (!this.state.moving) this._moveToNextTile();
  }

  heal(hp) {
    const max = this.getMaxHp();
    const before = this.state.hp;
    if (this.state.hp + hp > max) this.state.hp = max;
    else this.state.hp += hp;
    if (this.state.hp !== before) this.events.emit('hp', this.state.hp);
  }

  face(direction) {
    let d = direction;
    if (typeof direction !== 'string') {
      const {x, y} = this.getTile();
      if (x < direction.x) d = 'right';
      else if (x > direction.x) d = 'left';
      else if (y < direction.y) d = 'down';
      else d = 'up';
    }
    this.state.facing = d;
  }

  struck(entity) {
    this.state.hp -= 10;
    this.events.emit('hp', this.state.hp);
    if (this.state.hp < 1) this.kill();
    else if (!this.haveTarget()) this.attack(entity);
  }

  async kill() {
    this.state.hp = 0;
    this.events.emit('hp', this.state.hp);
    this._animate('death');
    await sleep(1000);
    this.state.sprite.kill();
    this.state.sprite.destroy();
    this.events.emit('death');
    if (this.haveTarget()) {
      const clear = this::this.clearTarget;
      this.state.target.events.removeListener('death', clear);
    }
    this.events.removeAllListeners();
  }

  attack(entity) {
    if (this._isDead()) return;
    if (entity) {
      this.state.target = entity;
      // TODO BUG!!! Stop listening on target switch.
      entity.events.once('death', this::this.clearTarget);
    }
    if (!this.haveTarget()) return;
    if (this._nextToTarget()) this._strike();
    else this.goTo(this.state.target.getTile());
  }

  getHp() {
    return this.state.hp;
  }
  
  getMaxHp() {
    return this.state.level * 10;
  }

  getTile() {
    return this.world.toTile(this.state.sprite);
  }
  
  getSprite() {
    return this.state.sprite;
  }

  isIdle() {
    return !this.state.target && !this.state.moving;
  }
  
  haveTarget() {
    return !!this.state.target;
  }

  _moveToNextTile() {
    if (this._isDead()) return;
    this.state.moving = true;
    this._faceNextTile();
    this._setWalkingAnimation();
    const {x, y} = this.world.toPixel(this._nextTile());
    const tween = this.game.add.tween(this.state.sprite);
    tween.to({x, y}, 400);
    tween.onComplete.addOnce(this::this._onNewTile);
    tween.start();
  }

  _onNewTile() {
    this.state.moving = false;
    this._advancePath();
    if (this.haveTarget() && this._nextToTarget()) this.attack();
    else if (this._nextTile()) this._moveToNextTile();
    else this._setIdleAnimation();
  }

  _nextToTarget() {
    const {x, y} = this.getTile();
    const {x: tx, y: ty} = this.state.target.getTile();
    if (x === tx && (y - 1 === ty || y + 1 === ty)) return true;
    return !!(y === ty && (x - 1 === tx || x + 1 === tx));
  }

  async _strike() {
    this.face(this.state.target.getTile());
    this._doAttackAnimation();
    await sleep(500);
    if (this._isDead()) return;
    if (!this.haveTarget()) return;
    this.state.target.struck(self);
    await sleep(500);
    this._setIdleAnimation();
    await sleep(1000);
    this.attack();
  }

  _faceNextTile() {
    const curr = this.getTile();
    const next = this._nextTile();
    let direction = 'down';
    if (curr.x < next.x) direction = 'right';
    else if (curr.x > next.x) direction = 'left';
    else if (curr.y < next.y) direction = 'down';
    else if (curr.y > next.y) direction = 'up';
    else console.warn('Current and Next tile were the same.');
    this.face(direction);
  }

  _doAttackAnimation() {
    this._animate('atk', this.state.facing);
  }

  _setWalkingAnimation() {
    this._animate('walk', this.state.facing);
  }

  _setIdleAnimation() {
    this._animate('idle', this.state.facing);
  }

  _animate(animation, facing) {
    if (facing === 'left') {
      facing = 'right';
      this.state.sprite.scale.x = -1;
    }
    else this.state.sprite.scale.x = 1;
    const animationName = facing? `${animation}_${facing}` : animation;
    this.state.sprite.animations.play(animationName);
  }

  _advancePath() {
    this.state.path.shift();
  }

  _nextTile() {
    if (!this.state.path.length) return null;
    return this.state.path[0];
  }

  _makeSprite({x, y}, spriteName) {
    this.state.sprite = this.game.add.sprite(x, y, spriteName);
    this.state.sprite.anchor.setTo(0.5, 0.5);
    this.face(this._randomFacing());
    this._createAnimations(spriteName);
  }

  _isDead() {
    return this.state.hp < 1;
  }

  _createAnimations(spriteName) {
    const data = this.game.cache.getJSON(spriteName);
    const rowLength = this.state.sprite.texture.width / data.width;
    Object.keys(data.animations).forEach((animationName) => {
      const animation = data.animations[animationName];
      const firstFrame = rowLength * animation.row;
      const mask = new Array(animation.length).fill(0);
      const frames = mask.map((v, i) => firstFrame + i);
      const args = [animationName, frames, animation.length, true];
      this.state.sprite.animations.add(...args);
    });
    this._animate('idle', this.state.facing);
  }

  _randomFacing() {
    return this.game.rnd.pick(['left', 'right', 'up', 'down']);
  }
}