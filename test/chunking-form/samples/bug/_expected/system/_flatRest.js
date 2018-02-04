System.register(['./flatten.js', './_overRest.js', './_setToString.js'], function (exports, module) {
  'use strict';
  var flatten, overRest, setToString;
  return {
    setters: [function (module) {
      flatten = module.default;
    }, function (module) {
      overRest = module.default;
    }, function (module) {
      setToString = module.default;
    }],
    execute: function () {

      /**
       * A specialized version of `baseRest` which flattens the rest array.
       *
       * @private
       * @param {Function} func The function to apply a rest parameter to.
       * @returns {Function} Returns the new function.
       */
      function flatRest(func) {
        return setToString(overRest(func, undefined, flatten), func + '');
      }
      exports('default', flatRest);

    }
  };
});
