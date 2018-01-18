define(['external', './chunk.js'], function (external, __chunk_js) { 'use strict';

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
      __chunk_js.fn();
    }
  }

  return Main2;

});
