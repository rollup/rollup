define(['./_baseTimes.js', './isArguments.js', './isArray.js', './isBuffer.js', './_isIndex.js', './isTypedArray.js'], function (___baseTimes_js, __isArguments_js, __isArray_js, __isBuffer_js, ___isIndex_js, __isTypedArray_js) { 'use strict';

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * Creates an array of the enumerable property names of the array-like `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @param {boolean} inherited Specify returning inherited property names.
   * @returns {Array} Returns the array of property names.
   */
  function arrayLikeKeys(value, inherited) {
    var isArr = __isArray_js.default(value),
        isArg = !isArr && __isArguments_js.default(value),
        isBuff = !isArr && !isArg && __isBuffer_js.default(value),
        isType = !isArr && !isArg && !isBuff && __isTypedArray_js.default(value),
        skipIndexes = isArr || isArg || isBuff || isType,
        result = skipIndexes ? ___baseTimes_js.default(value.length, String) : [],
        length = result.length;

    for (var key in value) {
      if ((inherited || hasOwnProperty.call(value, key)) &&
          !(skipIndexes && (
             // Safari 9 has enumerable `arguments.length` in strict mode.
             key == 'length' ||
             // Node.js 0.10 has enumerable non-index properties on buffers.
             (isBuff && (key == 'offset' || key == 'parent')) ||
             // PhantomJS 2 has enumerable non-index properties on typed arrays.
             (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
             // Skip index properties.
             ___isIndex_js.default(key, length)
          ))) {
        result.push(key);
      }
    }
    return result;
  }

  return arrayLikeKeys;

});
