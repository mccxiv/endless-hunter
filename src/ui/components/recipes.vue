<template>
  <ul class="recipes">
    <recipe
      v-for="item in recipe"
      track-by="$index"
      :name="item"
    ></recipe>
  </ul>
</template>

<script type="text/babel">
  import Items from '../../game/classes/Items';
  import Recipe from './recipe.vue';



  export default {
    components: {Recipe},
    data() {
      const {recipe, inventory} = this.$root.state;
      return {recipe, inventory};
    },
    ready() {this.applyCheckmarks()},
    methods: {
      clearCheckmarks() {
        const selector = '.recipes .checked[data-item-name]';
        const checked = document.querySelectorAll(selector);
        for (let li of checked) {
          li.classList.remove('checked')
        }
      },
      applyCheckmarks() {
        this.inventory.forEach((item) => {
          const selector = `.recipes [data-item-name="${item}"]:not(.checked)`;
          const el = document.querySelector(selector);
          if (el) el.classList.add('checked');
        });
      }
    },
    watch: {
      inventory() {
        this.clearCheckmarks();
        this.applyCheckmarks();
      }
    }
  }
</script>

<style>
  .recipes, .recipes ul {
    list-style: none;
    padding-left: 10px;
    margin: 0;
  }

  .recipes li {
    white-space: nowrap;
  }

  .recipes li.checked::after {
    content: ' ✅';
  }
</style>