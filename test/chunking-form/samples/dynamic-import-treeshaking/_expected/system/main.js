System.register(['./chunk-4d8f4e43.js'], function (exports, module) {
  'use strict';
  var multiplier;
  return {
    setters: [function (module) {
      multiplier = module.a;
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
