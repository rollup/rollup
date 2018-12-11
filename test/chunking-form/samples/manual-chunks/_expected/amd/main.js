define(['./deps2and3-609a33db.js', './lib1-4c530ea2.js'], function (__chunk_1, __chunk_2) { 'use strict';

  function fn () {
    console.log('dep1 fn');
  }

  class Main {
    constructor () {
      fn();
      __chunk_1.fn();
      __chunk_1.fn$1();
    }
  }

  return Main;

});
