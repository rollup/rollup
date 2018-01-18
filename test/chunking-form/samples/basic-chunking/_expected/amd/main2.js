define(['./chunk.js'], function (__chunk_js) { 'use strict';

  function fn () {
    console.log('lib1 fn');
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
