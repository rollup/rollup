define(['./chunk1.js'], function (__chunk1_js) { 'use strict';

  function calc (num) {
    return num * __chunk1_js.multiplier;
  }

  function fn (num) {
    return num * calc(num);
  }

  console.log(fn(5));

});
