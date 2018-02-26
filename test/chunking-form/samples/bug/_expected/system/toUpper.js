System.register(['./toString.js'], function (exports, module) {
  'use strict';
  var toString;
  return {
    setters: [function (module) {
      toString = module.default;
    }],
    execute: function () {

      /**
       * Converts `string`, as a whole, to upper case just like
       * [String#toUpperCase](https://mdn.io/toUpperCase).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category String
       * @param {string} [string=''] The string to convert.
       * @returns {string} Returns the upper cased string.
       * @example
       *
       * _.toUpper('--foo-bar--');
       * // => '--FOO-BAR--'
       *
       * _.toUpper('fooBar');
       * // => 'FOOBAR'
       *
       * _.toUpper('__foo_bar__');
       * // => '__FOO_BAR__'
       */
      function toUpper(value) {
        return toString(value).toUpperCase();
      }
      exports('default', toUpper);

    }
  };
});
