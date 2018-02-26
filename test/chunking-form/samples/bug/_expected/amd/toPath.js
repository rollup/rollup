define(['./_arrayMap.js', './_copyArray.js', './isArray.js', './isSymbol.js', './_stringToPath.js', './_toKey.js', './toString.js'], function (___arrayMap_js, ___copyArray_js, __isArray_js, __isSymbol_js, ___stringToPath_js, ___toKey_js, __toString_js) { 'use strict';

  /**
   * Converts `value` to a property path array.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Util
   * @param {*} value The value to convert.
   * @returns {Array} Returns the new property path array.
   * @example
   *
   * _.toPath('a.b.c');
   * // => ['a', 'b', 'c']
   *
   * _.toPath('a[0].b.c');
   * // => ['a', '0', 'b', 'c']
   */
  function toPath(value) {
    if (__isArray_js.default(value)) {
      return ___arrayMap_js.default(value, ___toKey_js.default);
    }
    return __isSymbol_js.default(value) ? [value] : ___copyArray_js.default(___stringToPath_js.default(__toString_js.default(value)));
  }

  return toPath;

});
