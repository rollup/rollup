define(['./_arraySample.js', './_baseSample.js', './isArray.js'], function (___arraySample_js, ___baseSample_js, __isArray_js) { 'use strict';

  /**
   * Gets a random element from `collection`.
   *
   * @static
   * @memberOf _
   * @since 2.0.0
   * @category Collection
   * @param {Array|Object} collection The collection to sample.
   * @returns {*} Returns the random element.
   * @example
   *
   * _.sample([1, 2, 3, 4]);
   * // => 2
   */
  function sample(collection) {
    var func = __isArray_js.default(collection) ? ___arraySample_js.default : ___baseSample_js.default;
    return func(collection);
  }

  return sample;

});
