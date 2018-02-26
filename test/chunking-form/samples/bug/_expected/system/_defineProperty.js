System.register(['./_getNative.js'], function (exports, module) {
  'use strict';
  var getNative;
  return {
    setters: [function (module) {
      getNative = module.default;
    }],
    execute: function () {

      var defineProperty = (function() {
        try {
          var func = getNative(Object, 'defineProperty');
          func({}, '', {});
          return func;
        } catch (e) {}
      }());
      exports('default', defineProperty);

    }
  };
});
