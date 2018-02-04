'use strict';

var ___baseKeys_js = require('./_baseKeys.js');
var ___getTag_js = require('./_getTag.js');
var __isArguments_js = require('./isArguments.js');
var __isArray_js = require('./isArray.js');
var __isArrayLike_js = require('./isArrayLike.js');
var __isBuffer_js = require('./isBuffer.js');
var ___isPrototype_js = require('./_isPrototype.js');
var __isTypedArray_js = require('./isTypedArray.js');

/** `Object#toString` result references. */
var mapTag = '[object Map]',
    setTag = '[object Set]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Checks if `value` is an empty object, collection, map, or set.
 *
 * Objects are considered empty if they have no own enumerable string keyed
 * properties.
 *
 * Array-like values such as `arguments` objects, arrays, buffers, strings, or
 * jQuery-like collections are considered empty if they have a `length` of `0`.
 * Similarly, maps and sets are considered empty if they have a `size` of `0`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
 * @example
 *
 * _.isEmpty(null);
 * // => true
 *
 * _.isEmpty(true);
 * // => true
 *
 * _.isEmpty(1);
 * // => true
 *
 * _.isEmpty([1, 2, 3]);
 * // => false
 *
 * _.isEmpty({ 'a': 1 });
 * // => false
 */
function isEmpty(value) {
  if (value == null) {
    return true;
  }
  if (__isArrayLike_js.default(value) &&
      (__isArray_js.default(value) || typeof value == 'string' || typeof value.splice == 'function' ||
        __isBuffer_js.default(value) || __isTypedArray_js.default(value) || __isArguments_js.default(value))) {
    return !value.length;
  }
  var tag = ___getTag_js.default(value);
  if (tag == mapTag || tag == setTag) {
    return !value.size;
  }
  if (___isPrototype_js.default(value)) {
    return !___baseKeys_js.default(value).length;
  }
  for (var key in value) {
    if (hasOwnProperty.call(value, key)) {
      return false;
    }
  }
  return true;
}

module.exports = isEmpty;
