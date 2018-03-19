define(['require', './chunk-909b409c.js'], function (require, __chunk_15) { 'use strict';

  function calc (num) {
    return num * __chunk_15.multiplier;
  }

  function fn (num) {
    return num * calc(num);
  }

  console.log(fn(5));

});
