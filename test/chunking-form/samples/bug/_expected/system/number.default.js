System.register(['./clamp.js', './inRange.js', './random.js'], function (exports, module) {
  'use strict';
  var clamp, inRange, random;
  return {
    setters: [function (module) {
      clamp = module.default;
    }, function (module) {
      inRange = module.default;
    }, function (module) {
      random = module.default;
    }],
    execute: function () {

      var number = exports('default', {
        clamp, inRange, random
      });

    }
  };
});
