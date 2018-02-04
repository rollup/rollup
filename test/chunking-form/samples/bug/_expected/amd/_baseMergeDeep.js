define(['./_assignMergeValue.js', './_cloneBuffer.js', './_cloneTypedArray.js', './_copyArray.js', './_initCloneObject.js', './isArguments.js', './isArray.js', './isArrayLikeObject.js', './isBuffer.js', './isFunction.js', './isObject.js', './isPlainObject.js', './isTypedArray.js', './_safeGet.js', './toPlainObject.js'], function (___assignMergeValue_js, ___cloneBuffer_js, ___cloneTypedArray_js, ___copyArray_js, ___initCloneObject_js, __isArguments_js, __isArray_js, __isArrayLikeObject_js, __isBuffer_js, __isFunction_js, __isObject_js, __isPlainObject_js, __isTypedArray_js, ___safeGet_js, __toPlainObject_js) { 'use strict';

  /**
   * A specialized version of `baseMerge` for arrays and objects which performs
   * deep merges and tracks traversed objects enabling objects with circular
   * references to be merged.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @param {string} key The key of the value to merge.
   * @param {number} srcIndex The index of `source`.
   * @param {Function} mergeFunc The function to merge values.
   * @param {Function} [customizer] The function to customize assigned values.
   * @param {Object} [stack] Tracks traversed source values and their merged
   *  counterparts.
   */
  function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
    var objValue = ___safeGet_js.default(object, key),
        srcValue = ___safeGet_js.default(source, key),
        stacked = stack.get(srcValue);

    if (stacked) {
      ___assignMergeValue_js.default(object, key, stacked);
      return;
    }
    var newValue = customizer
      ? customizer(objValue, srcValue, (key + ''), object, source, stack)
      : undefined;

    var isCommon = newValue === undefined;

    if (isCommon) {
      var isArr = __isArray_js.default(srcValue),
          isBuff = !isArr && __isBuffer_js.default(srcValue),
          isTyped = !isArr && !isBuff && __isTypedArray_js.default(srcValue);

      newValue = srcValue;
      if (isArr || isBuff || isTyped) {
        if (__isArray_js.default(objValue)) {
          newValue = objValue;
        }
        else if (__isArrayLikeObject_js.default(objValue)) {
          newValue = ___copyArray_js.default(objValue);
        }
        else if (isBuff) {
          isCommon = false;
          newValue = ___cloneBuffer_js.default(srcValue, true);
        }
        else if (isTyped) {
          isCommon = false;
          newValue = ___cloneTypedArray_js.default(srcValue, true);
        }
        else {
          newValue = [];
        }
      }
      else if (__isPlainObject_js.default(srcValue) || __isArguments_js.default(srcValue)) {
        newValue = objValue;
        if (__isArguments_js.default(objValue)) {
          newValue = __toPlainObject_js.default(objValue);
        }
        else if (!__isObject_js.default(objValue) || (srcIndex && __isFunction_js.default(objValue))) {
          newValue = ___initCloneObject_js.default(srcValue);
        }
      }
      else {
        isCommon = false;
      }
    }
    if (isCommon) {
      // Recursively merge objects and arrays (susceptible to call stack limits).
      stack.set(srcValue, newValue);
      mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
      stack['delete'](srcValue);
    }
    ___assignMergeValue_js.default(object, key, newValue);
  }

  return baseMergeDeep;

});
