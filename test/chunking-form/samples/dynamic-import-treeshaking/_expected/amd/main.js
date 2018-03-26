define(['require', './chunk-dd50f329.js'], function (require, __chunk_1) { 'use strict';

  function calc (num) {
    return num * __chunk_1.multiplier;
  }

  function fn (num) {
    return num * calc(num);
  }

  console.log(fn(5));

});
