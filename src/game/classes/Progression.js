import Items from './Items';

export default function Progression(state) {

  return  {
    canUpgrade,
    levelUp,
    addToInventory,
    getNeededDrops
  };

  function canUpgrade() {return !getNeededDrops().length}
  function addToInventory(item) {state.inventory.push(item)}

  function levelUp() {
    spendRecipeMaterials();
    state.recipe.push(...Items.generateRandomRecipe());
    state.level++;
  }

  /** Use up all the drops from the inventory
   *  That are needed for the current recipe.
   *  Leaves the other inventory items alone. */
  function spendRecipeMaterials() {
    Items.dropsNeededForItems(state.recipe).forEach((item) => {
      const i = state.inventory.indexOf(item);
      state.inventory.splice(i, 1);
    });
    state.recipe.splice(0, state.recipe.length);
  }

  /** List of drops still needed to complete the current recipe
   *  @returns {string[]} */
  function getNeededDrops() {
    const clonedInventory = state.inventory.slice();
    const missing = [];
    const itemsUnFlattened = state.recipe.map(Items.dropsNeededForItem);
    const items = itemsUnFlattened.reduce((a, b) => a.concat(b), []);
    items.forEach((item) => {
      const i = clonedInventory.indexOf(item);
      if (i < 0) missing.push(item);
      else clonedInventory.splice(i, 1);
    });
    return missing;
  }

  function getWeapon() {
    return items.weapons[state.level % items.weapons.length]
  }

  function getNextWeapon() {
    return items.weapons[(state.level + 1) % items.weapons.length];
  }
}