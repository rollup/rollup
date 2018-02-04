define(['./_arrayFilter.js', './_arrayMap.js', './_baseProperty.js', './_baseTimes.js', './isArrayLikeObject.js'], function (___arrayFilter_js, ___arrayMap_js, ___baseProperty_js, ___baseTimes_js, __isArrayLikeObject_js) { 'use strict';

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMax = Math.max;

  /**
   * This method is like `_.zip` except that it accepts an array of grouped
   * elements and creates an array regrouping the elements to their pre-zip
   * configuration.
   *
   * @static
   * @memberOf _
   * @since 1.2.0
   * @category Array
   * @param {Array} array The array of grouped elements to process.
   * @returns {Array} Returns the new array of regrouped elements.
   * @example
   *
   * var zipped = _.zip(['a', 'b'], [1, 2], [true, false]);
   * // => [['a', 1, true], ['b', 2, false]]
   *
   * _.unzip(zipped);
   * // => [['a', 'b'], [1, 2], [true, false]]
   */
  function unzip(array) {
    if (!(array && array.length)) {
      return [];
    }
    var length = 0;
    array = ___arrayFilter_js.default(array, function(group) {
      if (__isArrayLikeObject_js.default(group)) {
        length = nativeMax(group.length, length);
        return true;
      }
    });
    return ___baseTimes_js.default(length, function(index) {
      return ___arrayMap_js.default(array, ___baseProperty_js.default(index));
    });
  }

  return unzip;

});
