define(['./_createRelationalOperation.js'], function (___createRelationalOperation_js) { 'use strict';

  /**
   * Checks if `value` is less than or equal to `other`.
   *
   * @static
   * @memberOf _
   * @since 3.9.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if `value` is less than or equal to
   *  `other`, else `false`.
   * @see _.gte
   * @example
   *
   * _.lte(1, 3);
   * // => true
   *
   * _.lte(3, 3);
   * // => true
   *
   * _.lte(3, 1);
   * // => false
   */
  var lte = ___createRelationalOperation_js.default(function(value, other) {
    return value <= other;
  });

  return lte;

});
