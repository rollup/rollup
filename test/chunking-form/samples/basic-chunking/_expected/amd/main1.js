define(['./chunk-bd892da6.js'], function (__chunkBd892da6_js) { 'use strict';

  function fn () {
    console.log('dep1 fn');
  }

  class Main1 {
    constructor () {
      fn();
      __chunkBd892da6_js.fn();
    }
  }

  return Main1;

});
