define(['./_baseFlatten.js', './toInteger.js'], function (___baseFlatten_js, __toInteger_js) { 'use strict';

  /**
   * Recursively flatten `array` up to `depth` times.
   *
   * @static
   * @memberOf _
   * @since 4.4.0
   * @category Array
   * @param {Array} array The array to flatten.
   * @param {number} [depth=1] The maximum recursion depth.
   * @returns {Array} Returns the new flattened array.
   * @example
   *
   * var array = [1, [2, [3, [4]], 5]];
   *
   * _.flattenDepth(array, 1);
   * // => [1, 2, [3, [4]], 5]
   *
   * _.flattenDepth(array, 2);
   * // => [1, 2, 3, [4], 5]
   */
  function flattenDepth(array, depth) {
    var length = array == null ? 0 : array.length;
    if (!length) {
      return [];
    }
    depth = depth === undefined ? 1 : __toInteger_js.default(depth);
    return ___baseFlatten_js.default(array, depth);
  }

  return flattenDepth;

});
