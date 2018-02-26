System.register(['./_baseAssignValue.js', './eq.js'], function (exports, module) {
  'use strict';
  var baseAssignValue, eq;
  return {
    setters: [function (module) {
      baseAssignValue = module.default;
    }, function (module) {
      eq = module.default;
    }],
    execute: function () {

      /**
       * This function is like `assignValue` except that it doesn't assign
       * `undefined` values.
       *
       * @private
       * @param {Object} object The object to modify.
       * @param {string} key The key of the property to assign.
       * @param {*} value The value to assign.
       */
      function assignMergeValue(object, key, value) {
        if ((value !== undefined && !eq(object[key], value)) ||
            (value === undefined && !(key in object))) {
          baseAssignValue(object, key, value);
        }
      }
      exports('default', assignMergeValue);

    }
  };
});
