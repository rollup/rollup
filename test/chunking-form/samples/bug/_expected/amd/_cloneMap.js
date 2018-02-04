define(['./_addMapEntry.js', './_arrayReduce.js', './_mapToArray.js'], function (___addMapEntry_js, ___arrayReduce_js, ___mapToArray_js) { 'use strict';

  /** Used to compose bitmasks for cloning. */
  var CLONE_DEEP_FLAG = 1;

  /**
   * Creates a clone of `map`.
   *
   * @private
   * @param {Object} map The map to clone.
   * @param {Function} cloneFunc The function to clone values.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the cloned map.
   */
  function cloneMap(map, isDeep, cloneFunc) {
    var array = isDeep ? cloneFunc(___mapToArray_js.default(map), CLONE_DEEP_FLAG) : ___mapToArray_js.default(map);
    return ___arrayReduce_js.default(array, ___addMapEntry_js.default, new map.constructor);
  }

  return cloneMap;

});
