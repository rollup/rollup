define(['./chunk.js'], function (__chunk_js) { 'use strict';

  function calc (num) {
    return num * __chunk_js.multiplier;
  }

  function fn (num) {
    return num * calc(num);
  }

  console.log(fn(5));

});
