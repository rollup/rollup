'use strict';

var ___arrayMap_js = require('./_arrayMap.js');
var ___baseIndexOf_js = require('./_baseIndexOf.js');
var ___baseIndexOfWith_js = require('./_baseIndexOfWith.js');
var ___baseUnary_js = require('./_baseUnary.js');
var ___copyArray_js = require('./_copyArray.js');

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * The base implementation of `_.pullAllBy` without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to remove.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns `array`.
 */
function basePullAll(array, values, iteratee, comparator) {
  var indexOf = comparator ? ___baseIndexOfWith_js.default : ___baseIndexOf_js.default,
      index = -1,
      length = values.length,
      seen = array;

  if (array === values) {
    values = ___copyArray_js.default(values);
  }
  if (iteratee) {
    seen = ___arrayMap_js.default(array, ___baseUnary_js.default(iteratee));
  }
  while (++index < length) {
    var fromIndex = 0,
        value = values[index],
        computed = iteratee ? iteratee(value) : value;

    while ((fromIndex = indexOf(seen, computed, fromIndex, comparator)) > -1) {
      if (seen !== array) {
        splice.call(seen, fromIndex, 1);
      }
      splice.call(array, fromIndex, 1);
    }
  }
  return array;
}

module.exports = basePullAll;
