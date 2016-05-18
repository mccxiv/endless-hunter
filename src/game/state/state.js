import Items from '../classes/Items';

export default {
  level: 1,
  energy: 100,
  healthiness: 100,
  inventory: [],
  recipe: [...Items.generateRandomRecipe()],
  activity: null
};;
