'use strict';

var ___arrayMap_js = require('./_arrayMap.js');
var ___copyArray_js = require('./_copyArray.js');
var __isArray_js = require('./isArray.js');
var __isSymbol_js = require('./isSymbol.js');
var ___stringToPath_js = require('./_stringToPath.js');
var ___toKey_js = require('./_toKey.js');
var __toString_js = require('./toString.js');

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

module.exports = toPath;
