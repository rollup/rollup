System.register(['./chunk-abdba260.js'], function (exports, module) {
  'use strict';
  var multiplier;
  return {
    setters: [function (module) {
      multiplier = module.a;
    }],
    execute: function () {

      exports('mult', mult);
      function mult (num) {
        return num + multiplier;
      }

    }
  };
});
