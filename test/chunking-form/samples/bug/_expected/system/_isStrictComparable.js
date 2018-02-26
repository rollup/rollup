System.register(['./isObject.js'], function (exports, module) {
  'use strict';
  var isObject;
  return {
    setters: [function (module) {
      isObject = module.default;
    }],
    execute: function () {

      /**
       * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
       *
       * @private
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` if suitable for strict
       *  equality comparisons, else `false`.
       */
      function isStrictComparable(value) {
        return value === value && !isObject(value);
      }
      exports('default', isStrictComparable);

    }
  };
});
