System.register(['./chunk-b2c58526.js'], function (exports, module) {
  'use strict';
  var multiplier;
  return {
    setters: [function (module) {
      multiplier = module.multiplier;
    }],
    execute: function () {

      exports('mult', mult);
      function mult (num) {
        return num + multiplier;
      }

    }
  };
});
