'use strict';

var ___arrayMap_js = require('./_arrayMap.js');
var ___baseAt_js = require('./_baseAt.js');
var ___basePullAt_js = require('./_basePullAt.js');
var ___compareAscending_js = require('./_compareAscending.js');
var ___flatRest_js = require('./_flatRest.js');
var ___isIndex_js = require('./_isIndex.js');

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

module.exports = pullAt;
