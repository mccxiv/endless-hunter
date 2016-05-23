import sleep from 'sleep-promise';
import EventEmitter from 'events';

export default class Entity {
  constructor({tile: {x, y}, spriteName, level, game, world}) {
    this.game = game;
    this.world = world;
    this.events = new EventEmitter();
    this.state = {
      sprites: [],
      path: [],
      moving: false,
      facing: null,
      hp: level * 10,
      target: null
    };
    this._addSprite({name: spriteName, position: world.toPixel({x, y})});
    this.state.facing = this._randomFacing();
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
    this._mainSprite().kill();
    this._mainSprite().destroy();
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
      if (!entity.events) {
        console.warn('missing events?', entity);
      }
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
    return this.world.toTile(this._mainSprite());
  }
  
  getSprite() {
    return this._mainSprite();
  }

  isIdle() {
    return !this.state.target && !this.state.moving;
  }
  
  haveTarget() {
    return !!this.state.target;
  }
  
  _mainSprite() {
    return this.state.sprites[0];
  }

  _moveToNextTile() {
    if (this._isDead()) return;
    this.state.moving = true;
    this._faceNextTile();
    this._setWalkingAnimation();
    const {x, y} = this.world.toPixel(this._nextTile());
    const tween = this.game.add.tween(this._mainSprite());
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
    this.state.sprites.forEach((sprite) => {
      if (facing === 'left') {
        facing = 'right';
        sprite.scale.x = -1;
      }
      else sprite.scale.x = 1;
      const animationName = facing? `${animation}_${facing}` : animation;
      sprite.animations.play(animationName);
    });
  }

  _advancePath() {
    this.state.path.shift();
  }

  _nextTile() {
    if (!this.state.path.length) return null;
    return this.state.path[0];
  }

  _addSprite({name, position}) {
    let child = false;
    if (!position) {child = true;}
    const {x, y} = position || {x: 0, y: 0};
    let sprite;
    if (!child) sprite = this.game.add.sprite(x, y, name);
    else {
      sprite = this.game.make.sprite(x, y, name);
      this._mainSprite().addChild(sprite);
    }
    sprite.anchor.setTo(0.5, 0.5);
    this._createAnimations(sprite, name);
    this.state.sprites.push(sprite);
  }

  _isDead() {
    return this.state.hp < 1;
  }

  _createAnimations(sprite, spriteName) {
    const data = this.game.cache.getJSON(spriteName);
    const rowLength = sprite.texture.width / data.width;
    Object.keys(data.animations).forEach((animationName) => {
      const animation = data.animations[animationName];
      const firstFrame = rowLength * animation.row;
      const mask = new Array(animation.length).fill(0);
      const frames = mask.map((v, i) => firstFrame + i);
      const args = [animationName, frames, animation.length, true];
      sprite.animations.add(...args);
    });
    this._animate('idle', this.state.facing);
  }

  _randomFacing() {
    return this.game.rnd.pick(['left', 'right', 'up', 'down']);
  }
}