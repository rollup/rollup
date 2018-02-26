System.register(['./toString.js', './upperFirst.js'], function (exports, module) {
  'use strict';
  var toString, upperFirst;
  return {
    setters: [function (module) {
      toString = module.default;
    }, function (module) {
      upperFirst = module.default;
    }],
    execute: function () {

      /**
       * Converts the first character of `string` to upper case and the remaining
       * to lower case.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category String
       * @param {string} [string=''] The string to capitalize.
       * @returns {string} Returns the capitalized string.
       * @example
       *
       * _.capitalize('FRED');
       * // => 'Fred'
       */
      function capitalize(string) {
        return upperFirst(toString(string).toLowerCase());
      }
      exports('capitalize', capitalize);

    }
  };
});
