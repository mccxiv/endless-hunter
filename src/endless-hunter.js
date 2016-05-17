import Vue from 'vue';
import Main from './main.vue';

export default class EndlessHunter {
  constructor({el: selector}) {
    new Vue({
      el: selector,
      components: {Main},
      template: '<main></main>',
      replace: false
    });
  }
}