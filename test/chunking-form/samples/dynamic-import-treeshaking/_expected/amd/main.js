define(['./chunk-36864708.js'], function (__chunk36864708_js) { 'use strict';

  function calc (num) {
    return num * __chunk36864708_js.multiplier;
  }

  function fn (num) {
    return num * calc(num);
  }

  console.log(fn(5));

});
