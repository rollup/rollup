System.register(['./identity.js', './_overRest.js', './_setToString.js'], function (exports, module) {
  'use strict';
  var identity, overRest, setToString;
  return {
    setters: [function (module) {
      identity = module.default;
    }, function (module) {
      overRest = module.default;
    }, function (module) {
      setToString = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `_.rest` which doesn't validate or coerce arguments.
       *
       * @private
       * @param {Function} func The function to apply a rest parameter to.
       * @param {number} [start=func.length-1] The start position of the rest parameter.
       * @returns {Function} Returns the new function.
       */
      function baseRest(func, start) {
        return setToString(overRest(func, start, identity), func + '');
      }
      exports('default', baseRest);

    }
  };
});
