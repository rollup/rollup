define(['./_arrayFilter.js', './stubArray.js'], function (___arrayFilter_js, __stubArray_js) { 'use strict';

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /** Built-in value references. */
  var propertyIsEnumerable = objectProto.propertyIsEnumerable;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeGetSymbols = Object.getOwnPropertySymbols;

  /**
   * Creates an array of the own enumerable symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of symbols.
   */
  var getSymbols = !nativeGetSymbols ? __stubArray_js.default : function(object) {
    if (object == null) {
      return [];
    }
    object = Object(object);
    return ___arrayFilter_js.default(nativeGetSymbols(object), function(symbol) {
      return propertyIsEnumerable.call(object, symbol);
    });
  };

  return getSymbols;

});
