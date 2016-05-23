import sleep from 'sleep-promise';
import EventEmitter from 'events';

export default class Entity {
  game = null;
  world = null;
  events = new EventEmitter();
  animationSpeed = 1.4;
  state = {
    sprites: [],
    path: [],
    level: null,
    moving: false,
    resting: false,
    facing: null,
    hp: null,
    target: null
  };

  constructor({tile: {x, y}, spriteName, level, game, world}) {
    this.game = game;
    this.world = world;
    this.state.level = level;
    this.state.hp = level * 10;
    this.state.facing = this._randomFacing();

    console.log(spriteName);
    this._addSprite({name: spriteName, position: world.toPixel({x, y})});
    this._onTargetKilledBound = this::this._onTargetKilled;
    this._setupEventEmitters();
    this._setIdleAnimation();
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
    if (this.state.hp + hp > max) this.state.hp = max;
    else this.state.hp += hp;
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
    if (!this.haveTarget()) this.attack(entity);
  }

  async kill() {
    this.state.hp = 0;
    this.events.emit('death');
    const death = this._animate('death');
    death.onComplete.addOnce(() => {
      this._mainSprite().kill();
      this._mainSprite().destroy();
      if (this.haveTarget()) {
        const cb = this._onTargetKilledBound;
        this.state.target.events.removeListener('death', cb);
      }
      this.events.removeAllListeners();
    });
  }

  attack(entity) {
    if (this._isDead()) return;
    if (entity) {
      this.state.target = entity;
      // TODO BUG!!! Stop listening on target switch.
      entity.events.once('death', this._onTargetKilledBound);
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
    return !this.state.target && !this.state.moving && !this.state.resting;
  }
  
  haveTarget() {
    return !!this.state.target;
  }
  
  getMainSpriteName() {
    return this._mainSprite().key;
  }

  async _onTargetKilled() {
    this.state.resting = true;
    this.state.target = null;
    await sleep(1200);
    this.state.resting = false;
  }
  
  _mainSprite() {
    return this.state.sprites[0];
  }

  _setupEventEmitters() {
    let hp = this.state.hp;
    Object.defineProperty(this.state, 'hp', {
      get: () => hp,
      set: (changed) => {
        if (changed !== hp) {
          hp = changed < 0? 0 : changed;
          this.events.emit('hp', changed);
          if (changed === 0) this.kill();
        }
      }
    })
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
    const animation = this._doAttackAnimation();
    const animationDuration = 1000 / this.animationSpeed;
    const halfAnimationDuration = Math.floor(animationDuration / 2);
    animation.onComplete.addOnce(async () => {
      this._setIdleAnimation();
      await sleep(1000);
      this.attack();
    });
    await sleep(halfAnimationDuration);
    if (this._isDead()) return;
    if (!this.haveTarget()) return;
    this.state.target.struck(this);
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
    return this._animate('atk', this.state.facing);
  }

  _setWalkingAnimation() {
    return this._animate('walk', this.state.facing);
  }

  _setIdleAnimation() {
    return this._animate('idle', this.state.facing, true);
  }

  _animate(animation, facing, loop = false) {
    return this.state.sprites.map((sprite) => {
      if (facing === 'left') {
        facing = 'right';
        sprite.scale.x = -1;
      }
      else sprite.scale.x = 1;
      const animationName = facing? `${animation}_${facing}` : animation;
      return sprite.animations.play(animationName, null, loop);
    })[0];
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
      const fps = animation.length * this.animationSpeed;
      const args = [animationName, frames, fps, true];
      sprite.animations.add(...args);
    });
    this._animate('idle', this.state.facing);
  }

  _randomFacing() {
    return this.game.rnd.pick(['left', 'right', 'up', 'down']);
  }
}