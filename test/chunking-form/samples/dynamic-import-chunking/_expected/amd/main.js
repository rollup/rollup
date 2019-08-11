define(['require', './generated-dep4'], function (require, dep4) { 'use strict';

  function calc (num) {
    return num * dep4.multiplier;
  }

  function fn (num) {
    return num * calc(num);
  }

  function dynamic (num) {
    return new Promise(function (resolve, reject) { require(['./generated-dep2'], resolve, reject) })
    .then(dep2 => {
      return dep2.mult(num);
    });
  }

  console.log(fn(5));

  dynamic(10).then(num => {
    console.log(num);
  });

});
