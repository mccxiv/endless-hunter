<template>
  <span class="level">Lv. <span class="number">{{state.level}}</span></span>
</template>

<script type="text/babel">
  export default {
    data() {return {state: this.$root.state}}
  }
</script>

<style scoped>
  .level {
    position: absolute;
    bottom: 0;
    font-size: 17px;
    left: 698px;
  }
</style>