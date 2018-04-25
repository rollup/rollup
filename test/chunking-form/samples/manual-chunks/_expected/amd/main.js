define(['./deps2and3-0c5d98d0.js', './lib1-4c530ea2.js'], function (__chunk_2, __chunk_1) { 'use strict';

  function fn () {
    console.log('dep1 fn');
  }

  class Main {
    constructor () {
      fn();
      __chunk_2.fn();
      __chunk_2.fn$1();
    }
  }

  return Main;

});
