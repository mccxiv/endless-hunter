<template>
  <li data-item-name="{{name}}">{{name}}</li>
  <ul v-if="ingredients">
    <recipe
      v-for="item in ingredients"
      track-by="$index"
      :name="item"
    ></recipe>
  </ul>
</template>

<script type="text/babel">
  import Items from '../../game/classes/Items';

  export default {
    name: 'recipe',
    props: ['name'],
    computed: {
      ingredients() {return Items.getIngredients(this.name)}
    }
  }
</script>