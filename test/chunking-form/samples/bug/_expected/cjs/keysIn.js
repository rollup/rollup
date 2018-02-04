'use strict';

var ___arrayLikeKeys_js = require('./_arrayLikeKeys.js');
var ___baseKeysIn_js = require('./_baseKeysIn.js');
var __isArrayLike_js = require('./isArrayLike.js');

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn$1(object) {
  return __isArrayLike_js.default(object) ? ___arrayLikeKeys_js.default(object, true) : ___baseKeysIn_js.default(object);
}

module.exports = keysIn$1;
