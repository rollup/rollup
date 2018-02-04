define(['./_baseSlice.js'], function (___baseSlice_js) { 'use strict';

  /**
   * The base implementation of methods like `_.dropWhile` and `_.takeWhile`
   * without support for iteratee shorthands.
   *
   * @private
   * @param {Array} array The array to query.
   * @param {Function} predicate The function invoked per iteration.
   * @param {boolean} [isDrop] Specify dropping elements instead of taking them.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Array} Returns the slice of `array`.
   */
  function baseWhile(array, predicate, isDrop, fromRight) {
    var length = array.length,
        index = fromRight ? length : -1;

    while ((fromRight ? index-- : ++index < length) &&
      predicate(array[index], index, array)) {}

    return isDrop
      ? ___baseSlice_js.default(array, (fromRight ? 0 : index), (fromRight ? index + 1 : length))
      : ___baseSlice_js.default(array, (fromRight ? index + 1 : 0), (fromRight ? length : index));
  }

  return baseWhile;

});
