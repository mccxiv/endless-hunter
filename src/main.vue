<template>
  <div class="game">
    <div v-el:canvas></div>
    <bar></bar>
    <health></health>
    <task></task>
    <level></level>
    <box>
      <recipes></recipes>
    </box>
  </div>
</template>

<script type="text/babel">
  import Bar from './ui/components/bar.vue';
  import Task from './ui/components/task.vue';
  import Box from './ui/components/box.vue';
  import Recipes from './ui/components/recipes.vue';
  import Health from './ui/components/health.vue';
  import Level from './ui/components/level.vue';
  import Notifications from './ui/components/notifications.vue';
  import Game from './game/game';

  export default {
    components: {Bar, Health, Task, Level, Notifications, Box, Recipes},
    ready() {new Game(this.$els.canvas)}
  }
</script>

<style>
  .game {
    color: #C3C3C3;
    position: relative;
    padding-bottom: 32px;
    font-family: AdvoCut, sans-serif;
  }

  .game {box-sizing: border-box}
  .game * {box-sizing: inherit}

  @font-face {
    font-family: 'AdvoCut';
    src: url('./ui/fonts/AdvoCut.woff') format('woff');
  }
</style>