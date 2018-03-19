define(['./chunk-b663d499.js'], function (__chunk_9) { 'use strict';

  function fn () {
    console.log('dep1 fn');
  }

  class Main1 {
    constructor () {
      fn();
      __chunk_9.fn();
    }
  }

  return Main1;

});
