import 'babel-polyfill';
import items from '../assets/items/items.yaml';
import {RandomDataGenerator} from 'phaser-shim';

const rnd = new RandomDataGenerator();
rnd.sow([Date.now()]);

export default class Items {

  /** Turn a drop or craft into a list of drops
   *  @param {string} item
   *  @return {string[]} */
  static dropsNeededForItem(item) {
    if(Items.isDrop(item)) return [item];
    else {
      const ingredients = Items.getCraftRequirements(item);
      const drops = ingredients.map(Items.dropsNeededForItem);
      return drops.reduce((a, b) => a.concat(b), []);
    }
  }

  static dropsNeededForItems(items) {
    const arrOfArrs = items.map(Items.dropsNeededForItem);
    return arrOfArrs.reduce((a, b) => a.concat(b), []);
  }

  static getIngredients(item) {
    if (Items.isDrop(item)) return false;
    return Items.getCraftRequirements(item);
  }

  static getCraftRequirements(item) {
    return items.crafts[item];
  }

  /** Get a random list craft materials.
   *  Repeats can happen.
   *  Between 2 and 5, with a preference for lower numbers.
   *  @returns {string[]} */
  static generateRandomRecipe() {
    const craftNames = Object.keys(items.crafts);
    const numberOfCraftsNeeded = rnd.weightedPick([2, 3, 4, 5]);
    return new Array(numberOfCraftsNeeded).fill(1).map(() => {
      return rnd.pick(craftNames);
    });
  }

  static getDropRarity(drop) {
    if (items.drops.common.includes(drop)) return 'common';
    if (items.drops.rare.includes(drop)) return 'rare';
    return null;
  }
  
  static isDrop(drop) {
    return !!Items.getDropRarity(drop);
  }

  static isRareDrop(drop) {
    return items.drops.rare.includes(drop);
  }
}