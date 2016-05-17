import Items from '../classes/Items';

export default {
  level: 1,
  healthiness: 100,
  inventory: [],
  recipe: [...Items.generateRandomRecipe()],
  activity: null
};;
