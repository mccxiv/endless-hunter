import Items from '../classes/Items';

export default function createState() {
  return {
    level: 1,
    energy: 100,
    healthiness: 100,
    inventory: [],
    recipe: [...Items.generateRandomRecipe()],
    activity: null
  };
}
