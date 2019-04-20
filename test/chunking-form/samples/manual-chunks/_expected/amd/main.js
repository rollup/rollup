define(['./generated-deps2and3', './generated-lib1'], function (__chunk_1, __chunk_2) { 'use strict';

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
