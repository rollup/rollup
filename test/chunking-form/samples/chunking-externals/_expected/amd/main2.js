define(['external', './chunk-b663d499.js'], function (external, __chunk_9) { 'use strict';

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
      __chunk_9.fn();
    }
  }

  return Main2;

});
