import state from '../state/state';
import sleep from 'sleep-promise';
import Items from '../classes/Items';
import Phaser from 'phaser-shim';
import Tilemap from '../classes/World';
import Entity from '../classes/Entity';
import Progression from '../classes/Progression';
import CameraManager from '../classes/CameraManager';

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
    this.state = state;
    this.upgradeLocation = {x: 0, y: 0};
    this.tilemap = new Tilemap();
    this.player = new Entity(this.tilemap.getSpawnLocation(), 'platearmor', 10);
    this.cameraManager = new CameraManager();
    this.monsters = new Map();
    this.progression = new Progression(this.state);
    this.items = Items;
    this.cameraPos= new Phaser.Point(0, 0);
  }
  
	create() {
    this.listenToClicks();
    this.makePlayer();
    this.cameraManager.setSprite(this.player.getSprite());
    this.setInitialCameraPosition();

    setInterval(() => this.player.heal(1), 225); // Regen player HP.
    this.spawnMonster(26, 7);
    this.spawnMonster(20, 8);
    this.spawnMonster(22, 9);
    window.game = this; // TODO remove
	}
  
  update() {
    this.updateCamera();
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

  updateCamera() {

  }

  notUpgrading() {
    return this.state.activity !== 'UPGRADING';
  }
  
  hasEnergy() {
    return !!this.state.energy;
  }

  isAtUpgradeLocation() {
    const {x, y} = this.player.getTile();
    const target = this.upgradeLocation;
    return x === target.x && y === target.y;
  }

  goToUpgradeLocation() {
    this.state.activity = 'WALKING_TO_UPGRADE';
    this.player.goTo(this.upgradeLocation);
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
  }

  onMonsterDeath() {
    this.state.activity = null;
    const integerInRange = this.game.rnd.integerInRange.bind(this.game.rnd);
    const neededDrop = this.progression.getNeededDrops()[0];
    const rarity = this.items.getDropRarity(neededDrop);
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

  setInitialCameraPosition() {
    const playerPos = this.player.getSprite().position;
    this.cameraPos.x = playerPos.x;
    this.cameraPos.y = playerPos.y;
    this.camera.focusOn(this.player.getSprite());
    //this.camera.follow(this.player.getSprite());
  }

  spawnMonster(x, y) {
    const monster = new Entity({x, y}, 'rat', this.state.level);
    this.monsters.set(monster, true);

    monster.events.once('death', async () => {
      this.onMonsterDeath();
      this.monsters.delete(monster);
      await sleep(5000);
      this.spawnMonster(x, y);
    });
  }

  getNextMonster() {
    return this.monsters.keys().next().value;
  }

  listenToClicks() {
    this.input.onTap.add(this.handleTileClick.bind(this));
  }

  handleTileClick({x, y}) {
    const {x: offsetX, y: offsetY} = this.game.world.worldPosition;
    x += -offsetX;
    y += -offsetY;
    const point = this.tilemap.toTile({x, y});
    this.player.clearTarget();
    this.state.activity = null;
    this.player.goTo(point);

    console.log('clicked at ', {x, y});
    console.log('Moving to: ', point.x, point.y);
  }
}