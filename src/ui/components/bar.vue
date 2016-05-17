<template>
  <img class="bar" :src="image">
</template>

<script type="text/babel">
  import image from '../img/bar.png';

  export default {
    data: () => ({image})
  }
</script>

<style scoped>
  .bar {
    position: absolute;
    bottom: 0;
    left: 0;
  }
</style>