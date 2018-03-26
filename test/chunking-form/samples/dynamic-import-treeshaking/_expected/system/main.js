System.register(['./chunk-b2c58526.js'], function (exports, module) {
  'use strict';
  var multiplier;
  return {
    setters: [function (module) {
      multiplier = module.multiplier;
    }],
    execute: function () {

      function calc (num) {
        return num * multiplier;
      }

      function fn (num) {
        return num * calc(num);
      }

      console.log(fn(5));

    }
  };
});
