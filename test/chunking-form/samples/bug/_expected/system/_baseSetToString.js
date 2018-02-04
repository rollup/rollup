System.register(['./constant.js', './_defineProperty.js', './identity.js'], function (exports, module) {
  'use strict';
  var constant, defineProperty, identity;
  return {
    setters: [function (module) {
      constant = module.default;
    }, function (module) {
      defineProperty = module.default;
    }, function (module) {
      identity = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `setToString` without support for hot loop shorting.
       *
       * @private
       * @param {Function} func The function to modify.
       * @param {Function} string The `toString` result.
       * @returns {Function} Returns `func`.
       */
      var baseSetToString = !defineProperty ? identity : function(func, string) {
        return defineProperty(func, 'toString', {
          'configurable': true,
          'enumerable': false,
          'value': constant(string),
          'writable': true
        });
      };
      exports('default', baseSetToString);

    }
  };
});
