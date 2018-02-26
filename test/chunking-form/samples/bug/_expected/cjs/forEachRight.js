'use strict';

var ___arrayEachRight_js = require('./_arrayEachRight.js');
var ___baseEachRight_js = require('./_baseEachRight.js');
var ___castFunction_js = require('./_castFunction.js');
var __isArray_js = require('./isArray.js');

/**
 * This method is like `_.forEach` except that it iterates over elements of
 * `collection` from right to left.
 *
 * @static
 * @memberOf _
 * @since 2.0.0
 * @alias eachRight
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 * @see _.forEach
 * @example
 *
 * _.forEachRight([1, 2], function(value) {
 *   console.log(value);
 * });
 * // => Logs `2` then `1`.
 */
function forEachRight(collection, iteratee) {
  var func = __isArray_js.default(collection) ? ___arrayEachRight_js.default : ___baseEachRight_js.default;
  return func(collection, ___castFunction_js.default(iteratee));
}

module.exports = forEachRight;
