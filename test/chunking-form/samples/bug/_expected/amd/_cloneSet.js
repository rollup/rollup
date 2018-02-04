define(['./_addSetEntry.js', './_arrayReduce.js', './_setToArray.js'], function (___addSetEntry_js, ___arrayReduce_js, ___setToArray_js) { 'use strict';

  /** Used to compose bitmasks for cloning. */
  var CLONE_DEEP_FLAG = 1;

  /**
   * Creates a clone of `set`.
   *
   * @private
   * @param {Object} set The set to clone.
   * @param {Function} cloneFunc The function to clone values.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the cloned set.
   */
  function cloneSet(set, isDeep, cloneFunc) {
    var array = isDeep ? cloneFunc(___setToArray_js.default(set), CLONE_DEEP_FLAG) : ___setToArray_js.default(set);
    return ___arrayReduce_js.default(array, ___addSetEntry_js.default, new set.constructor);
  }

  return cloneSet;

});
