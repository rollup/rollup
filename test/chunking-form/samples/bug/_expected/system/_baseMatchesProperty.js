System.register(['./_baseIsEqual.js', './get.js', './hasIn.js', './_isKey.js', './_isStrictComparable.js', './_matchesStrictComparable.js', './_toKey.js'], function (exports, module) {
  'use strict';
  var baseIsEqual, get, hasIn, isKey, isStrictComparable, matchesStrictComparable, toKey;
  return {
    setters: [function (module) {
      baseIsEqual = module.default;
    }, function (module) {
      get = module.default;
    }, function (module) {
      hasIn = module.default;
    }, function (module) {
      isKey = module.default;
    }, function (module) {
      isStrictComparable = module.default;
    }, function (module) {
      matchesStrictComparable = module.default;
    }, function (module) {
      toKey = module.default;
    }],
    execute: function () {

      /** Used to compose bitmasks for value comparisons. */
      var COMPARE_PARTIAL_FLAG = 1,
          COMPARE_UNORDERED_FLAG = 2;

      /**
       * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
       *
       * @private
       * @param {string} path The path of the property to get.
       * @param {*} srcValue The value to match.
       * @returns {Function} Returns the new spec function.
       */
      function baseMatchesProperty(path, srcValue) {
        if (isKey(path) && isStrictComparable(srcValue)) {
          return matchesStrictComparable(toKey(path), srcValue);
        }
        return function(object) {
          var objValue = get(object, path);
          return (objValue === undefined && objValue === srcValue)
            ? hasIn(object, path)
            : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
        };
      }
      exports('default', baseMatchesProperty);

    }
  };
});
