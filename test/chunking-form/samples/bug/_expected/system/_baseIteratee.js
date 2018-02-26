System.register(['./_baseMatches.js', './_baseMatchesProperty.js', './identity.js', './isArray.js', './property.js'], function (exports, module) {
  'use strict';
  var baseMatches, baseMatchesProperty, identity, isArray, property;
  return {
    setters: [function (module) {
      baseMatches = module.default;
    }, function (module) {
      baseMatchesProperty = module.default;
    }, function (module) {
      identity = module.default;
    }, function (module) {
      isArray = module.default;
    }, function (module) {
      property = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `_.iteratee`.
       *
       * @private
       * @param {*} [value=_.identity] The value to convert to an iteratee.
       * @returns {Function} Returns the iteratee.
       */
      function baseIteratee(value) {
        // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
        // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
        if (typeof value == 'function') {
          return value;
        }
        if (value == null) {
          return identity;
        }
        if (typeof value == 'object') {
          return isArray(value)
            ? baseMatchesProperty(value[0], value[1])
            : baseMatches(value);
        }
        return property(value);
      }
      exports('default', baseIteratee);

    }
  };
});
