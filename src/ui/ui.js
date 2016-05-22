import Main from './main.vue';
import Vue from 'vue';

export default class Ui {
  constructor(element, state) {
    this.vue = new Vue({
      el: element,
      data: {state},
      components: {Main},
      template: '<main></main>',
      replace: false
    });
  }
}
