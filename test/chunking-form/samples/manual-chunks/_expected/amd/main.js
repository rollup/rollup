define(['./deps2and3-f10dec76.js', './lib1-89a376a1.js'], function (__chunk_2, __chunk_1) { 'use strict';

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
