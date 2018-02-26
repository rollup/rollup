define(['./_arrayMap.js', './_baseAt.js', './_basePullAt.js', './_compareAscending.js', './_flatRest.js', './_isIndex.js'], function (___arrayMap_js, ___baseAt_js, ___basePullAt_js, ___compareAscending_js, ___flatRest_js, ___isIndex_js) { 'use strict';

  /**
   * Removes elements from `array` corresponding to `indexes` and returns an
   * array of removed elements.
   *
   * **Note:** Unlike `_.at`, this method mutates `array`.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Array
   * @param {Array} array The array to modify.
   * @param {...(number|number[])} [indexes] The indexes of elements to remove.
   * @returns {Array} Returns the new array of removed elements.
   * @example
   *
   * var array = ['a', 'b', 'c', 'd'];
   * var pulled = _.pullAt(array, [1, 3]);
   *
   * console.log(array);
   * // => ['a', 'c']
   *
   * console.log(pulled);
   * // => ['b', 'd']
   */
  var pullAt = ___flatRest_js.default(function(array, indexes) {
    var length = array == null ? 0 : array.length,
        result = ___baseAt_js.default(array, indexes);

    ___basePullAt_js.default(array, ___arrayMap_js.default(indexes, function(index) {
      return ___isIndex_js.default(index, length) ? +index : index;
    }).sort(___compareAscending_js.default));

    return result;
  });

  return pullAt;

});
