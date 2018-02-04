define(['./_Stack.js', './_arrayEach.js', './_assignValue.js', './_baseAssign.js', './_baseAssignIn.js', './_cloneBuffer.js', './_copyArray.js', './_copySymbols.js', './_copySymbolsIn.js', './_getAllKeys.js', './_getAllKeysIn.js', './_getTag.js', './_initCloneArray.js', './_initCloneByTag.js', './_initCloneObject.js', './isArray.js', './isBuffer.js', './isMap.js', './isObject.js', './isSet.js', './keys.js'], function (___Stack_js, ___arrayEach_js, ___assignValue_js, ___baseAssign_js, ___baseAssignIn_js, ___cloneBuffer_js, ___copyArray_js, ___copySymbols_js, ___copySymbolsIn_js, ___getAllKeys_js, ___getAllKeysIn_js, ___getTag_js, ___initCloneArray_js, ___initCloneByTag_js, ___initCloneObject_js, __isArray_js, __isBuffer_js, __isMap_js, __isObject_js, __isSet_js, __keys_js) { 'use strict';

  /** Used to compose bitmasks for cloning. */
  var CLONE_DEEP_FLAG = 1,
      CLONE_FLAT_FLAG = 2,
      CLONE_SYMBOLS_FLAG = 4;

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]',
      arrayTag = '[object Array]',
      boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      errorTag = '[object Error]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      objectTag = '[object Object]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      symbolTag = '[object Symbol]',
      weakMapTag = '[object WeakMap]';

  var arrayBufferTag = '[object ArrayBuffer]',
      dataViewTag = '[object DataView]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';

  /** Used to identify `toStringTag` values supported by `_.clone`. */
  var cloneableTags = {};
  cloneableTags[argsTag] = cloneableTags[arrayTag] =
  cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
  cloneableTags[boolTag] = cloneableTags[dateTag] =
  cloneableTags[float32Tag] = cloneableTags[float64Tag] =
  cloneableTags[int8Tag] = cloneableTags[int16Tag] =
  cloneableTags[int32Tag] = cloneableTags[mapTag] =
  cloneableTags[numberTag] = cloneableTags[objectTag] =
  cloneableTags[regexpTag] = cloneableTags[setTag] =
  cloneableTags[stringTag] = cloneableTags[symbolTag] =
  cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
  cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
  cloneableTags[errorTag] = cloneableTags[funcTag] =
  cloneableTags[weakMapTag] = false;

  /**
   * The base implementation of `_.clone` and `_.cloneDeep` which tracks
   * traversed objects.
   *
   * @private
   * @param {*} value The value to clone.
   * @param {boolean} bitmask The bitmask flags.
   *  1 - Deep clone
   *  2 - Flatten inherited properties
   *  4 - Clone symbols
   * @param {Function} [customizer] The function to customize cloning.
   * @param {string} [key] The key of `value`.
   * @param {Object} [object] The parent object of `value`.
   * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
   * @returns {*} Returns the cloned value.
   */
  function baseClone(value, bitmask, customizer, key, object, stack) {
    var result,
        isDeep = bitmask & CLONE_DEEP_FLAG,
        isFlat = bitmask & CLONE_FLAT_FLAG,
        isFull = bitmask & CLONE_SYMBOLS_FLAG;

    if (customizer) {
      result = object ? customizer(value, key, object, stack) : customizer(value);
    }
    if (result !== undefined) {
      return result;
    }
    if (!__isObject_js.default(value)) {
      return value;
    }
    var isArr = __isArray_js.default(value);
    if (isArr) {
      result = ___initCloneArray_js.default(value);
      if (!isDeep) {
        return ___copyArray_js.default(value, result);
      }
    } else {
      var tag = ___getTag_js.default(value),
          isFunc = tag == funcTag || tag == genTag;

      if (__isBuffer_js.default(value)) {
        return ___cloneBuffer_js.default(value, isDeep);
      }
      if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
        result = (isFlat || isFunc) ? {} : ___initCloneObject_js.default(value);
        if (!isDeep) {
          return isFlat
            ? ___copySymbolsIn_js.default(value, ___baseAssignIn_js.default(result, value))
            : ___copySymbols_js.default(value, ___baseAssign_js.default(result, value));
        }
      } else {
        if (!cloneableTags[tag]) {
          return object ? value : {};
        }
        result = ___initCloneByTag_js.default(value, tag, isDeep);
      }
    }
    // Check for circular references and return its corresponding clone.
    stack || (stack = new ___Stack_js.default);
    var stacked = stack.get(value);
    if (stacked) {
      return stacked;
    }
    stack.set(value, result);

    if (__isSet_js.default(value)) {
      value.forEach(function(subValue) {
        result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
      });

      return result;
    }

    if (__isMap_js.default(value)) {
      value.forEach(function(subValue, key) {
        result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
      });

      return result;
    }

    var keysFunc = isFull
      ? (isFlat ? ___getAllKeysIn_js.default : ___getAllKeys_js.default)
      : (isFlat ? keysIn : __keys_js.default);

    var props = isArr ? undefined : keysFunc(value);
    ___arrayEach_js.default(props || value, function(subValue, key) {
      if (props) {
        key = subValue;
        subValue = value[key];
      }
      // Recursively populate clone (susceptible to call stack limits).
      ___assignValue_js.default(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
    });
    return result;
  }

  return baseClone;

});
