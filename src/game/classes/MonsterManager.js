import sleep from 'sleep-promise';
import monsters from '../assets/monsters/monsters.yaml';
import Entity from './Entity';

export default class MonsterManager {
  _world = null;
  _game = null;
  _monsters = new Set();
  
  constructor({world, game}) {
    this._world = world;
    this._game = game;
  }

  spawnAll() {
    Object.keys(monsters).forEach((name) => {
      this._world.getEntityLocations(name).forEach(spawnLocation => {
        const data = this._game.cache.getJSON(name);
        this._createMonsterSpawner(spawnLocation, name, data.level * 10);
      });
    });
  }

  getRandomMonster(name) {
    return [...this._monsters].find(m => m.getMainSpriteName() === name);
  }

  _createMonsterSpawner(tile, spriteName, hp) {
    const game = this._game;
    const world = this._world;
    const monster = new Entity({tile, spriteName, hp, game, world});
    this._monsters.add(monster);

    monster.events.once('death', async () => {
      this._monsters.delete(monster);
      await sleep(5000);
      this._createMonsterSpawner(tile, spriteName, hp);
    });
  }
}
