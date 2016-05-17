<template>
  <div class="box">
    <div>
      <slot></slot>
    </div>
  </div>
</template>

<script type="text/babel">
  import 'gemini-scrollbar/gemini-scrollbar.css';
  import GeminiScrollbar from 'gemini-scrollbar';

  export default {
    ready() {
      const element = document.querySelector('.box > div');
      const gemini = new GeminiScrollbar({element}).create();
      setInterval(() => {gemini.update()}, 1000);
    }
  }
</script>

<style scoped>
  .box {
    position: absolute;
    bottom: 45px;
    left: 15px;
    border: 10px solid;
    border-image: url(../img/border.png) 10 10;
    background: url(../img/texture.png) repeat;
    width: 245px;
    height: 262px;
  }
</style>

<style>
  .box .gm-scrollbar-container .gm-scroll-view {
    padding-bottom: 15px;
  }
</style>