define(['./_baseUnset.js', './_isIndex.js'], function (___baseUnset_js, ___isIndex_js) { 'use strict';

  /** Used for built-in method references. */
  var arrayProto = Array.prototype;

  /** Built-in value references. */
  var splice = arrayProto.splice;

  /**
   * The base implementation of `_.pullAt` without support for individual
   * indexes or capturing the removed elements.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {number[]} indexes The indexes of elements to remove.
   * @returns {Array} Returns `array`.
   */
  function basePullAt(array, indexes) {
    var length = array ? indexes.length : 0,
        lastIndex = length - 1;

    while (length--) {
      var index = indexes[length];
      if (length == lastIndex || index !== previous) {
        var previous = index;
        if (___isIndex_js.default(index)) {
          splice.call(array, index, 1);
        } else {
          ___baseUnset_js.default(array, index);
        }
      }
    }
    return array;
  }

  return basePullAt;

});
