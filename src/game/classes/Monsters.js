import monsters from '../assets/monsters/monsters.yaml';

export default class Monsters {
  static thatDrops(drop) {
    return Object.keys(monsters).find(monsterName => {
      return monsters[monsterName].drops.includes(drop);
    });
  }
}
