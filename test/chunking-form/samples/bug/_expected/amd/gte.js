define(['./_createRelationalOperation.js'], function (___createRelationalOperation_js) { 'use strict';

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
  var gte = ___createRelationalOperation_js.default(function(value, other) {
    return value >= other;
  });

  return gte;

});
