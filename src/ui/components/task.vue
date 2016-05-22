<template>
  <span class="task">{{humanTaskText()}}</span>
</template>

<script type="text/babel">
  import Progression from '../../game/classes/Progression';

  const human = {
    'UPGRADING': 'Crafting upgrade',
    'WALKING_TO_UPGRADE': 'Ready to craft upgrade',
    'HUNTING': 'Hunting for a'
  };

  export default {
    data() {
      return {
        state: this.$root.state,
        progression: new Progression(this.$root.state)
      };
    },
    methods: {
      humanTaskText() {
        let text = human[this.state.activity] || '';
        if (this.state.activity === 'HUNTING') {
          const needed = this.progression.getNeededDrops();
          if (startsWithVowel(needed[0])) text += 'n';
          text += ` ${needed[0]}`;
          if (needed.length > 1) text += ` and ${needed.length - 1} more item`;
          if (needed.length > 2) text += 's';
        }
        return text;
      }
    }
  }

  function startsWithVowel(string) {
    return (/^[aeiou]$/i).test(string.charAt(0));
  }
</script>

<style scoped>
  .task {
    font-size: 17px;
    position: absolute;
    bottom: 0;
    left: 284px;
  }
</style>