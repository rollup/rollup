define(['external', './chunk1.js'], function (external, __chunk1_js) { 'use strict';

  function fn () {
    console.log('lib1 fn');
    external.fn();
  }

  function fn$1 () {
    fn();
    console.log('dep3 fn');
  }

  class Main2 {
    constructor () {
      fn$1();
      __chunk1_js.fn();
    }
  }

  return Main2;

});
