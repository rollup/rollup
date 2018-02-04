define(['./_apply.js', './_arrayMap.js', './unzip.js'], function (___apply_js, ___arrayMap_js, __unzip_js) { 'use strict';

  /**
   * This method is like `_.unzip` except that it accepts `iteratee` to specify
   * how regrouped values should be combined. The iteratee is invoked with the
   * elements of each group: (...group).
   *
   * @static
   * @memberOf _
   * @since 3.8.0
   * @category Array
   * @param {Array} array The array of grouped elements to process.
   * @param {Function} [iteratee=_.identity] The function to combine
   *  regrouped values.
   * @returns {Array} Returns the new array of regrouped elements.
   * @example
   *
   * var zipped = _.zip([1, 2], [10, 20], [100, 200]);
   * // => [[1, 10, 100], [2, 20, 200]]
   *
   * _.unzipWith(zipped, _.add);
   * // => [3, 30, 300]
   */
  function unzipWith(array, iteratee) {
    if (!(array && array.length)) {
      return [];
    }
    var result = __unzip_js.default(array);
    if (iteratee == null) {
      return result;
    }
    return ___arrayMap_js.default(result, function(group) {
      return ___apply_js.default(iteratee, undefined, group);
    });
  }

  return unzipWith;

});
