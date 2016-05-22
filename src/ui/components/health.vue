<template>
  <div class="health-bar">
    <div class="bar-container">
      <div class="bar" :style="{width: $root.state.healthiness +'%'}"></div>
    </div>
    <img :src="image">
  </div>
</template>

<script type="text/babel">
  import image from '../img/health.png';

  export default {
    data() {
      return {image}
    }
  }
</script>

<style scoped>
  .health-bar {
    position: absolute;
    height: 26px;
    bottom: 0;
    left: 0;
  }

  .bar-container, .bar, img {
    position: absolute;
  }

  .bar-container {
    top: 4px;
    left: 24px;
    height: 20px;
    width: 174px;
  }

  .bar {
    width: 100%;
    height: 100%;
    background-color: red;
  }
</style>