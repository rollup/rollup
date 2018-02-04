'use strict';

var ___Symbol_js = require('./_Symbol.js');
var ___copyArray_js = require('./_copyArray.js');
var ___getTag_js = require('./_getTag.js');
var __isArrayLike_js = require('./isArrayLike.js');
var __isString_js = require('./isString.js');
var ___iteratorToArray_js = require('./_iteratorToArray.js');
var ___mapToArray_js = require('./_mapToArray.js');
var ___setToArray_js = require('./_setToArray.js');
var ___stringToArray_js = require('./_stringToArray.js');
var __values_js = require('./values.js');

/** `Object#toString` result references. */
var mapTag = '[object Map]',
    setTag = '[object Set]';

/** Built-in value references. */
var symIterator = ___Symbol_js.default ? ___Symbol_js.default.iterator : undefined;

/**
 * Converts `value` to an array.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Array} Returns the converted array.
 * @example
 *
 * _.toArray({ 'a': 1, 'b': 2 });
 * // => [1, 2]
 *
 * _.toArray('abc');
 * // => ['a', 'b', 'c']
 *
 * _.toArray(1);
 * // => []
 *
 * _.toArray(null);
 * // => []
 */
function toArray(value) {
  if (!value) {
    return [];
  }
  if (__isArrayLike_js.default(value)) {
    return __isString_js.default(value) ? ___stringToArray_js.default(value) : ___copyArray_js.default(value);
  }
  if (symIterator && value[symIterator]) {
    return ___iteratorToArray_js.default(value[symIterator]());
  }
  var tag = ___getTag_js.default(value),
      func = tag == mapTag ? ___mapToArray_js.default : (tag == setTag ? ___setToArray_js.default : __values_js.default);

  return func(value);
}

module.exports = toArray;
