<template>
  <span class="level">Lv. <span class="number">{{state.level}}</span></span>
</template>

<script type="text/babel">
  import state from '../../game/state/state';

  export default {
    data: () => ({state})
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