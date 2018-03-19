System.register(['./chunk-909b409c.js'], function (exports, module) {
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
