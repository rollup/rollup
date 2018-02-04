define(['./_castPath.js', './isArguments.js', './isArray.js', './_isIndex.js', './isLength.js', './_toKey.js'], function (___castPath_js, __isArguments_js, __isArray_js, ___isIndex_js, __isLength_js, ___toKey_js) { 'use strict';

  /**
   * Checks if `path` exists on `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array|string} path The path to check.
   * @param {Function} hasFunc The function to check properties.
   * @returns {boolean} Returns `true` if `path` exists, else `false`.
   */
  function hasPath(object, path, hasFunc) {
    path = ___castPath_js.default(path, object);

    var index = -1,
        length = path.length,
        result = false;

    while (++index < length) {
      var key = ___toKey_js.default(path[index]);
      if (!(result = object != null && hasFunc(object, key))) {
        break;
      }
      object = object[key];
    }
    if (result || ++index != length) {
      return result;
    }
    length = object == null ? 0 : object.length;
    return !!length && __isLength_js.default(length) && ___isIndex_js.default(key, length) &&
      (__isArray_js.default(object) || __isArguments_js.default(object));
  }

  return hasPath;

});
