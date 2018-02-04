'use strict';

var ___baseKeys_js = require('./_baseKeys.js');
var ___getTag_js = require('./_getTag.js');
var __isArrayLike_js = require('./isArrayLike.js');
var __isString_js = require('./isString.js');
var ___stringSize_js = require('./_stringSize.js');

/** `Object#toString` result references. */
var mapTag = '[object Map]',
    setTag = '[object Set]';

/**
 * Gets the size of `collection` by returning its length for array-like
 * values or the number of own enumerable string keyed properties for objects.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object|string} collection The collection to inspect.
 * @returns {number} Returns the collection size.
 * @example
 *
 * _.size([1, 2, 3]);
 * // => 3
 *
 * _.size({ 'a': 1, 'b': 2 });
 * // => 2
 *
 * _.size('pebbles');
 * // => 7
 */
function size(collection) {
  if (collection == null) {
    return 0;
  }
  if (__isArrayLike_js.default(collection)) {
    return __isString_js.default(collection) ? ___stringSize_js.default(collection) : collection.length;
  }
  var tag = ___getTag_js.default(collection);
  if (tag == mapTag || tag == setTag) {
    return collection.size;
  }
  return ___baseKeys_js.default(collection).length;
}

module.exports = size;
