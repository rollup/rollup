define(['./chunk-aaa4e18a.js'], function (__chunk_1) { 'use strict';

  function fn () {
    console.log('dep1 fn');
  }

  class Main1 {
    constructor () {
      fn();
      __chunk_1.fn();
    }
  }

  return Main1;

});
