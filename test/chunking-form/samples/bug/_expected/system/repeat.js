System.register(['./_baseRepeat.js', './_isIterateeCall.js', './toInteger.js', './toString.js'], function (exports, module) {
  'use strict';
  var baseRepeat, isIterateeCall, toInteger, toString;
  return {
    setters: [function (module) {
      baseRepeat = module.default;
    }, function (module) {
      isIterateeCall = module.default;
    }, function (module) {
      toInteger = module.default;
    }, function (module) {
      toString = module.default;
    }],
    execute: function () {

      /**
       * Repeats the given string `n` times.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category String
       * @param {string} [string=''] The string to repeat.
       * @param {number} [n=1] The number of times to repeat the string.
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
       * @returns {string} Returns the repeated string.
       * @example
       *
       * _.repeat('*', 3);
       * // => '***'
       *
       * _.repeat('abc', 2);
       * // => 'abcabc'
       *
       * _.repeat('abc', 0);
       * // => ''
       */
      function repeat(string, n, guard) {
        if ((guard ? isIterateeCall(string, n, guard) : n === undefined)) {
          n = 1;
        } else {
          n = toInteger(n);
        }
        return baseRepeat(toString(string), n);
      }
      exports('default', repeat);

    }
  };
});
