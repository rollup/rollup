System.register(['./_createRelationalOperation.js'], function (exports, module) {
  'use strict';
  var createRelationalOperation;
  return {
    setters: [function (module) {
      createRelationalOperation = module.default;
    }],
    execute: function () {

      /**
       * Checks if `value` is greater than or equal to `other`.
       *
       * @static
       * @memberOf _
       * @since 3.9.0
       * @category Lang
       * @param {*} value The value to compare.
       * @param {*} other The other value to compare.
       * @returns {boolean} Returns `true` if `value` is greater than or equal to
       *  `other`, else `false`.
       * @see _.lte
       * @example
       *
       * _.gte(3, 1);
       * // => true
       *
       * _.gte(3, 3);
       * // => true
       *
       * _.gte(1, 3);
       * // => false
       */
      var gte = createRelationalOperation(function(value, other) {
        return value >= other;
      });
      exports('gte', gte);

    }
  };
});
