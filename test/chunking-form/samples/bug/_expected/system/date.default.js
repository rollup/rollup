System.register(['./now.js'], function (exports, module) {
  'use strict';
  var now;
  return {
    setters: [function (module) {
      now = module.default;
    }],
    execute: function () {

      var date = exports('default', {
        now
      });

    }
  };
});
