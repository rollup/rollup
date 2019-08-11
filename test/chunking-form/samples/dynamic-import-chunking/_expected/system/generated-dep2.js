System.register(['./generated-dep4.js'], function (exports) {
  'use strict';
  var multiplier;
  return {
    setters: [function (module) {
      multiplier = module.m;
    }],
    execute: function () {

      exports('mult', mult);

      function mult (num) {
        return num + multiplier;
      }

    }
  };
});
