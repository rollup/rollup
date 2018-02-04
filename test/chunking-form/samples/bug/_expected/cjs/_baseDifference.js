'use strict';

var ___SetCache_js = require('./_SetCache.js');
var ___arrayIncludes_js = require('./_arrayIncludes.js');
var ___arrayIncludesWith_js = require('./_arrayIncludesWith.js');
var ___arrayMap_js = require('./_arrayMap.js');
var ___baseUnary_js = require('./_baseUnary.js');
var ___cacheHas_js = require('./_cacheHas.js');

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * The base implementation of methods like `_.difference` without support
 * for excluding multiple arrays or iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Array} values The values to exclude.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new array of filtered values.
 */
function baseDifference(array, values, iteratee, comparator) {
  var index = -1,
      includes = ___arrayIncludes_js.default,
      isCommon = true,
      length = array.length,
      result = [],
      valuesLength = values.length;

  if (!length) {
    return result;
  }
  if (iteratee) {
    values = ___arrayMap_js.default(values, ___baseUnary_js.default(iteratee));
  }
  if (comparator) {
    includes = ___arrayIncludesWith_js.default;
    isCommon = false;
  }
  else if (values.length >= LARGE_ARRAY_SIZE) {
    includes = ___cacheHas_js.default;
    isCommon = false;
    values = new ___SetCache_js.default(values);
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = iteratee == null ? value : iteratee(value);

    value = (comparator || value !== 0) ? value : 0;
    if (isCommon && computed === computed) {
      var valuesIndex = valuesLength;
      while (valuesIndex--) {
        if (values[valuesIndex] === computed) {
          continue outer;
        }
      }
      result.push(value);
    }
    else if (!includes(values, computed, comparator)) {
      result.push(value);
    }
  }
  return result;
}

module.exports = baseDifference;
