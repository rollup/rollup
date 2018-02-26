define(['./_Stack.js', './_assignMergeValue.js', './_baseFor.js', './_baseMergeDeep.js', './isObject.js', './keysIn.js', './_safeGet.js'], function (___Stack_js, ___assignMergeValue_js, ___baseFor_js, ___baseMergeDeep_js, __isObject_js, __keysIn_js, ___safeGet_js) { 'use strict';

  /**
   * The base implementation of `_.merge` without support for multiple sources.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @param {number} srcIndex The index of `source`.
   * @param {Function} [customizer] The function to customize merged values.
   * @param {Object} [stack] Tracks traversed source values and their merged
   *  counterparts.
   */
  function baseMerge(object, source, srcIndex, customizer, stack) {
    if (object === source) {
      return;
    }
    ___baseFor_js.default(source, function(srcValue, key) {
      if (__isObject_js.default(srcValue)) {
        stack || (stack = new ___Stack_js.default);
        ___baseMergeDeep_js.default(object, source, key, srcIndex, baseMerge, customizer, stack);
      }
      else {
        var newValue = customizer
          ? customizer(___safeGet_js.default(object, key), srcValue, (key + ''), object, source, stack)
          : undefined;

        if (newValue === undefined) {
          newValue = srcValue;
        }
        ___assignMergeValue_js.default(object, key, newValue);
      }
    }, __keysIn_js.default);
  }

  return baseMerge;

});
