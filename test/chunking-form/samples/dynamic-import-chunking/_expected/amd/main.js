define(['require', './chunk-909b409c.js'], function (require, __chunk_14) { 'use strict';

  function calc (num) {
    return num * __chunk_14.multiplier;
  }

  function fn (num) {
    return num * calc(num);
  }

  function dynamic (num) {
    return new Promise(function (resolve, reject) { require(["dep2.js"], resolve, reject) })
    .then(dep2 => {
      return dep2.mult(num);
    });
  }

  console.log(fn(5));

  dynamic(10).then(num => {
    console.log(num);
  });

});
