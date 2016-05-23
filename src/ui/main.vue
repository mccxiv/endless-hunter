<template>
  <div class="ui">
    <bar></bar>
    <health></health>
    <task></task>
    <level></level>
    <box class="temp">
      <recipes></recipes>
    </box>
  </div>
</template>

<script type="text/babel">
  import Bar from './components/bar.vue';
  import Task from './components/task.vue';
  import Box from './components/box.vue';
  import Recipes from './components/recipes.vue';
  import Health from './components/health.vue';
  import Level from './components/level.vue';
  import Notifications from './components/notifications.vue';

  export default {
    components: {Bar, Health, Task, Level, Notifications, Box, Recipes}
  }
</script>

<style>
  .temp {display: none}

  .ui {
    color: #C3C3C3;
    position: relative;
    padding-bottom: 32px;
    font-family: AdvoCut, sans-serif;
  }

  .ui {box-sizing: border-box}
  .ui * {box-sizing: inherit}

  @font-face {
    font-family: 'AdvoCut';
    src: url('fonts/AdvoCut.woff') format('woff');
  }
</style>