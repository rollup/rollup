define(['./_Stack.js', './_equalArrays.js', './_equalByTag.js', './_equalObjects.js', './_getTag.js', './isArray.js', './isBuffer.js', './isTypedArray.js'], function (___Stack_js, ___equalArrays_js, ___equalByTag_js, ___equalObjects_js, ___getTag_js, __isArray_js, __isBuffer_js, __isTypedArray_js) { 'use strict';

  /** Used to compose bitmasks for value comparisons. */
  var COMPARE_PARTIAL_FLAG = 1;

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]',
      arrayTag = '[object Array]',
      objectTag = '[object Object]';

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * A specialized version of `baseIsEqual` for arrays and objects which performs
   * deep comparisons and tracks traversed objects enabling objects with circular
   * references to be compared.
   *
   * @private
   * @param {Object} object The object to compare.
   * @param {Object} other The other object to compare.
   * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
   * @param {Function} customizer The function to customize comparisons.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Object} [stack] Tracks traversed `object` and `other` objects.
   * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
   */
  function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
    var objIsArr = __isArray_js.default(object),
        othIsArr = __isArray_js.default(other),
        objTag = objIsArr ? arrayTag : ___getTag_js.default(object),
        othTag = othIsArr ? arrayTag : ___getTag_js.default(other);

    objTag = objTag == argsTag ? objectTag : objTag;
    othTag = othTag == argsTag ? objectTag : othTag;

    var objIsObj = objTag == objectTag,
        othIsObj = othTag == objectTag,
        isSameTag = objTag == othTag;

    if (isSameTag && __isBuffer_js.default(object)) {
      if (!__isBuffer_js.default(other)) {
        return false;
      }
      objIsArr = true;
      objIsObj = false;
    }
    if (isSameTag && !objIsObj) {
      stack || (stack = new ___Stack_js.default);
      return (objIsArr || __isTypedArray_js.default(object))
        ? ___equalArrays_js.default(object, other, bitmask, customizer, equalFunc, stack)
        : ___equalByTag_js.default(object, other, objTag, bitmask, customizer, equalFunc, stack);
    }
    if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
      var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
          othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

      if (objIsWrapped || othIsWrapped) {
        var objUnwrapped = objIsWrapped ? object.value() : object,
            othUnwrapped = othIsWrapped ? other.value() : other;

        stack || (stack = new ___Stack_js.default);
        return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
      }
    }
    if (!isSameTag) {
      return false;
    }
    stack || (stack = new ___Stack_js.default);
    return ___equalObjects_js.default(object, other, bitmask, customizer, equalFunc, stack);
  }

  return baseIsEqualDeep;

});
