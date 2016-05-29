import Items from '../classes/Items';

export default function createState() {
  return {
    experience: {
      combat: 0
    },
    energy: 1000,
    healthiness: 100,
    inventory: [],
    recipe: [...Items.generateRandomRecipe()],
    equipment: {
      armor: 'Plate Armor',
      weapon: 'Wooden Sword'
    },
    activity: null
  };
}
