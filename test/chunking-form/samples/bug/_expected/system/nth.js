System.register(['./_baseNth.js', './toInteger.js'], function (exports, module) {
  'use strict';
  var baseNth, toInteger;
  return {
    setters: [function (module) {
      baseNth = module.default;
    }, function (module) {
      toInteger = module.default;
    }],
    execute: function () {

      /**
       * Gets the element at index `n` of `array`. If `n` is negative, the nth
       * element from the end is returned.
       *
       * @static
       * @memberOf _
       * @since 4.11.0
       * @category Array
       * @param {Array} array The array to query.
       * @param {number} [n=0] The index of the element to return.
       * @returns {*} Returns the nth element of `array`.
       * @example
       *
       * var array = ['a', 'b', 'c', 'd'];
       *
       * _.nth(array, 1);
       * // => 'b'
       *
       * _.nth(array, -2);
       * // => 'c';
       */
      function nth(array, n) {
        return (array && array.length) ? baseNth(array, toInteger(n)) : undefined;
      }
      exports('default', nth);

    }
  };
});
