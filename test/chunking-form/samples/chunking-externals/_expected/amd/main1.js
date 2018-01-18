define(['./chunk.js'], function (__chunk_js) { 'use strict';

  function fn () {
    console.log('dep1 fn');
  }

  class Main1 {
    constructor () {
      fn();
      __chunk_js.fn();
    }
  }

  return Main1;

});
