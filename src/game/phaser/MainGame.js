import sleep from 'sleep-promise';
import Items from '../classes/Items';
import Phaser from 'phaser-shim';
import World from '../classes/World';
import Player from '../classes/Player';
import Progression from '../classes/Progression';
import CameraManager from '../classes/CameraManager';
import MonsterManager from '../classes/MonsterManager';

/** MainGame duties:
 *    - Decide what to do next, in the update loop.
 *    - Move the character to the right places to accomplish actions.
 *    - Perform actions, with the help of Progression's methods, if necessary.
 *    - Record successful actions via Progressions's methods.
 *
 *  P.S. Progression's methods generally deal with permanent state.
 *  Movement, combat, mining etc are not considered permanent state,
 *  because they are not saved to disk, only their results are. */
export default class MainGame extends Phaser.State {

  preload() {
    const main = this;
    this.state = this.game.gameState;
    this.events = this.game.events;
    this.tileWorld = new World(this);
    this.player = new Player({game: main.game, world: main.tileWorld});
    this.cameraManager = new CameraManager(this.game);
    this.monsterManager = new MonsterManager({game: main.game, world: this.tileWorld});
    this.progression = new Progression(this.state);
  }
  
	create() {
    this.listenToClicks();
    this.makePlayer();
    this.giveCameraManagerASpriteToFollow();
    this.monsterManager.spawnAll();

    setInterval(() => this.player.heal(1), 225); // Regen player HP.
    window.game = this; // TODO remove
	}
  
  update() {
    this.cameraManager.updatePosition();
    if (this.hasEnergy()) {
      if (this.player.isIdle()) {
        if (this.progression.canUpgrade()) {
          if (this.notUpgrading()) {
            if (!this.isAtUpgradeLocation()) this.goToUpgradeLocation();
            else this.startUpgrade();
          }
        }
        else this.hunt();
      }
    }
  }

  notUpgrading() {
    return this.state.activity !== 'UPGRADING';
  }
  
  hasEnergy() {
    return !!this.state.energy;
  }

  isAtUpgradeLocation() {
    const {x, y} = this.player.getTile();
    const target = this.tileWorld.getLocation('upgrade');
    return x === target.x && y === target.y;
  }

  goToUpgradeLocation() {
    this.state.activity = 'WALKING_TO_UPGRADE';
    this.player.goTo(this.tileWorld.getLocation('upgrade'));
  }

  startUpgrade() {
    this.state.activity = 'UPGRADING';
    setTimeout(() => {
      this.state.activity = null;
      this.progression.levelUp();
    }, 3000);
  }

  hunt() {
    const monster = this.getNextMonster();
    if (!monster) return;
    this.state.activity = 'HUNTING';
    this.player.attack(monster);
    monster.events.once('death', this::this.onMonsterDeath);
  }

  onMonsterDeath() {
    const integerInRange = this.game.rnd.integerInRange.bind(this.game.rnd);
    const neededDrop = this.progression.getNeededDrops()[0];
    const rarity = Items.getDropRarity(neededDrop);
    let dropped = false;
    if (rarity === 'common') dropped = oneIn(10);
    else if (rarity === 'rare') dropped = oneIn(40);
    if (dropped) {
      this.progression.addToInventory(neededDrop);
    }

    function oneIn(chance) {return integerInRange(1, chance) === 1}
  }

  makePlayer() {
    this.player.events.on('hp', hp => {
      this.state.healthiness = Math.round((hp / this.player.getMaxHp() * 100));
    });
    this.player.events.once('death', () => this.makePlayer());
  }

  giveCameraManagerASpriteToFollow() {
    this.cameraManager.setSprite(this.player.getSprite());
  }

  getNextMonster() {
    return this.monsterManager.getRandomMonster('rat');
  }

  listenToClicks() {
    this.input.onTap.add(this.handleTileClick.bind(this));
  }

  handleTileClick({x, y}) {
    const {x: offsetX, y: offsetY} = this.game.world.worldPosition;
    x += -offsetX;
    y += -offsetY;
    const point = this.tileWorld.toTile({x, y});
    this.player.clearTarget();
    this.state.activity = null;
    this.player.goTo(point);

    console.log('clicked at ', {x, y});
    console.log('Moving to: ', point.x, point.y);
  }
}