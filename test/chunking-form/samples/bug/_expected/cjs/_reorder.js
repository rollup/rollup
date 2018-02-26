'use strict';

var ___copyArray_js = require('./_copyArray.js');
var ___isIndex_js = require('./_isIndex.js');

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMin = Math.min;

/**
 * Reorder `array` according to the specified indexes where the element at
 * the first index is assigned as the first element, the element at
 * the second index is assigned as the second element, and so on.
 *
 * @private
 * @param {Array} array The array to reorder.
 * @param {Array} indexes The arranged array indexes.
 * @returns {Array} Returns `array`.
 */
function reorder(array, indexes) {
  var arrLength = array.length,
      length = nativeMin(indexes.length, arrLength),
      oldArray = ___copyArray_js.default(array);

  while (length--) {
    var index = indexes[length];
    array[length] = ___isIndex_js.default(index, arrLength) ? oldArray[index] : undefined;
  }
  return array;
}

module.exports = reorder;
