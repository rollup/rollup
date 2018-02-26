define(['./_arrayMap.js', './_baseClone.js', './_baseUnset.js', './_castPath.js', './_copyObject.js', './_customOmitClone.js', './_flatRest.js', './_getAllKeysIn.js'], function (___arrayMap_js, ___baseClone_js, ___baseUnset_js, ___castPath_js, ___copyObject_js, ___customOmitClone_js, ___flatRest_js, ___getAllKeysIn_js) { 'use strict';

  /** Used to compose bitmasks for cloning. */
  var CLONE_DEEP_FLAG = 1,
      CLONE_FLAT_FLAG = 2,
      CLONE_SYMBOLS_FLAG = 4;

  /**
   * The opposite of `_.pick`; this method creates an object composed of the
   * own and inherited enumerable property paths of `object` that are not omitted.
   *
   * **Note:** This method is considerably slower than `_.pick`.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The source object.
   * @param {...(string|string[])} [paths] The property paths to omit.
   * @returns {Object} Returns the new object.
   * @example
   *
   * var object = { 'a': 1, 'b': '2', 'c': 3 };
   *
   * _.omit(object, ['a', 'c']);
   * // => { 'b': '2' }
   */
  var omit = ___flatRest_js.default(function(object, paths) {
    var result = {};
    if (object == null) {
      return result;
    }
    var isDeep = false;
    paths = ___arrayMap_js.default(paths, function(path) {
      path = ___castPath_js.default(path, object);
      isDeep || (isDeep = path.length > 1);
      return path;
    });
    ___copyObject_js.default(object, ___getAllKeysIn_js.default(object), result);
    if (isDeep) {
      result = ___baseClone_js.default(result, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, ___customOmitClone_js.default);
    }
    var length = paths.length;
    while (length--) {
      ___baseUnset_js.default(result, paths[length]);
    }
    return result;
  });

  return omit;

});
