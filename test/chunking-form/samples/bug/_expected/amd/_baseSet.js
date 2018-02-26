define(['./_assignValue.js', './_castPath.js', './_isIndex.js', './isObject.js', './_toKey.js'], function (___assignValue_js, ___castPath_js, ___isIndex_js, __isObject_js, ___toKey_js) { 'use strict';

  /**
   * The base implementation of `_.set`.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {Array|string} path The path of the property to set.
   * @param {*} value The value to set.
   * @param {Function} [customizer] The function to customize path creation.
   * @returns {Object} Returns `object`.
   */
  function baseSet(object, path, value, customizer) {
    if (!__isObject_js.default(object)) {
      return object;
    }
    path = ___castPath_js.default(path, object);

    var index = -1,
        length = path.length,
        lastIndex = length - 1,
        nested = object;

    while (nested != null && ++index < length) {
      var key = ___toKey_js.default(path[index]),
          newValue = value;

      if (index != lastIndex) {
        var objValue = nested[key];
        newValue = customizer ? customizer(objValue, key, nested) : undefined;
        if (newValue === undefined) {
          newValue = __isObject_js.default(objValue)
            ? objValue
            : (___isIndex_js.default(path[index + 1]) ? [] : {});
        }
      }
      ___assignValue_js.default(nested, key, newValue);
      nested = nested[key];
    }
    return object;
  }

  return baseSet;

});
