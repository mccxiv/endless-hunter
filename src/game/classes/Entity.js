import sleep from 'sleep-promise';
import EventEmitter from 'events';
import Game from '../singletons/game';
import Tilemap from '../singletons/tilemap';

export default function ({x, y}, spriteName, level) {
  const state = {
    game: Game(),
    tilemap: Tilemap(),
    sprite: null,
    path: [],
    moving: false,
    facing: null,
    hp: level * 10,
    target: null,
    events: new EventEmitter()
  };
  const  self = {
    events: state.events,
    goTo,
    struck,
    attack,
    heal,
    getHp,
    getMaxHp,
    getTile,
    getSprite,
    isIdle,
    clearTarget
  };

  makeSprite(state.tilemap.toPixel({x, y}), spriteName);

  return self;

  function clearTarget() {
    state.target = null;
  }
  
  function goTo({x, y}) {
    const from = getTile();
    const path = state.tilemap.pathTo(from, {x, y});
    if (!path) return;
    state.path = path;
    if (!state.moving) moveToNextTile();
  }

  function heal(hp) {
    const max = this.getMaxHp();
    const before = state.hp;
    if (state.hp + hp > max) state.hp = max;
    else state.hp += hp;
    if (state.hp !== before) state.events.emit('hp', state.hp);
  }

  function face(direction) {
    let d = direction;
    if (typeof direction !== 'string') {
      const {x, y} = getTile();
      if (x < direction.x) d = 'right';
      else if (x > direction.x) d = 'left';
      else if (y < direction.y) d = 'down';
      else d = 'up';
    }
    state.facing = d;
  }

  function struck(entity) {
    state.hp -= 10;
    state.events.emit('hp', state.hp);
    if (state.hp < 1) kill();
    else if (!haveTarget()) attack(entity);
  }

  async function kill() {
    state.hp = 0;
    state.events.emit('hp', state.hp);
    animate('death');
    await sleep(1000);
    state.sprite.kill();
    state.sprite.destroy();
    state.events.emit('death');
    if (haveTarget()) state.target.events.removeListener('death', clearTarget);
    state.events.removeAllListeners();
  }

  function attack(entity) {
    if (isDead()) return;
    if (entity) {
      state.target = entity;
      // TODO BUG!!! Stop listening on target switch.
      entity.events.once('death', clearTarget);
    }
    if (!haveTarget()) return;
    if (nextToTarget()) strike();
    else goTo(state.target.getTile());
  }

  function getHp() {
    return state.hp;
  }
  
  function getMaxHp() {
    return level * 10;
  }

  function getTile() {
    return state.tilemap.toTile(state.sprite);
  }
  
  function getSprite() {
    return state.sprite;
  }

  function isIdle() {
    return !state.target && !state.moving;
  }

  function moveToNextTile() {
    if (isDead()) return;
    state.moving = true;
    faceNextTile();
    setWalkingAnimation();
    const {x, y} = state.tilemap.toPixel(nextTile());
    const tween = state.game.add.tween(state.sprite);
    tween.to({x, y}, 400);
    tween.onComplete.addOnce(onNewTile);
    tween.start();
  }

  function onNewTile() {
    state.moving = false;
    advancePath();
    if (haveTarget() && nextToTarget()) attack();
    else if (nextTile()) moveToNextTile();
    else setIdleAnimation();
  }

  function haveTarget() {
    return !!state.target;
  }

  function nextToTarget() {
    const {x, y} = getTile();
    const {x: tx, y: ty} = state.target.getTile();
    if (x === tx && (y - 1 === ty || y + 1 === ty)) return true;
    return !!(y === ty && (x - 1 === tx || x + 1 === tx));
  }

  async function strike() {
    face(state.target.getTile());
    doAttackAnimation();
    await sleep(500);
    if (isDead()) return;
    if (!haveTarget()) return;
    state.target.struck(self);
    await sleep(500);
    setIdleAnimation();
    await sleep(1000);
    attack();
  }

  function faceNextTile() {
    const curr = getTile();
    const next = nextTile();
    let direction = 'down';
    if (curr.x < next.x) direction = 'right';
    else if (curr.x > next.x) direction = 'left';
    else if (curr.y < next.y) direction = 'down';
    else if (curr.y > next.y) direction = 'up';
    else console.warn('Current and Next tile were the same.');
    face(direction);
  }

  function doAttackAnimation() {
    animate('atk', state.facing);
  }

  function setWalkingAnimation() {
    animate('walk', state.facing);
  }

  function setIdleAnimation() {
    animate('idle', state.facing);
  }

  function animate(animation, facing) {
    if (facing === 'left') {
      facing = 'right';
      state.sprite.scale.x = -1;
    }
    else state.sprite.scale.x = 1;
    const animationName = facing? `${animation}_${facing}` : animation;
    state.sprite.animations.play(animationName);
  }

  function advancePath() {
    state.path.shift();
  }

  function nextTile() {
    if (!state.path.length) return null;
    return state.path[0];
  }

  function makeSprite({x, y}, spriteName) {
    state.sprite = state.game.add.sprite(x, y, spriteName);
    state.sprite.anchor.setTo(0.5, 0.5);
    face(randomFacing());
    createAnimations(spriteName);
  }

  function isDead() {
    return state.hp < 1;
  }

  function createAnimations(spriteName) {
    const data = state.game.cache.getJSON(spriteName);
    const rowLength = state.sprite.texture.width / data.width;
    Object.keys(data.animations).forEach((animationName) => {
      const animation = data.animations[animationName];
      const firstFrame = rowLength * animation.row;
      const mask = new Array(animation.length).fill(0);
      const frames = mask.map((v, i) => firstFrame + i);
      const args = [animationName, frames, animation.length, true];
      state.sprite.animations.add(...args);
    });
    animate('idle', state.facing);
  }

  function randomFacing() {
    return state.game.rnd.pick(['left', 'right', 'up', 'down']);
  }
}