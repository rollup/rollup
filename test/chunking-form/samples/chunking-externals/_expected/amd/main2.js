define(['external', './chunk-bd892da6.js'], function (external, __chunkBd892da6_js) { 'use strict';

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
      __chunkBd892da6_js.fn();
    }
  }

  return Main2;

});
