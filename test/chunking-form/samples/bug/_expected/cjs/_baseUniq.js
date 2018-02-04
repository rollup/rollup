'use strict';

var ___SetCache_js = require('./_SetCache.js');
var ___arrayIncludes_js = require('./_arrayIncludes.js');
var ___arrayIncludesWith_js = require('./_arrayIncludesWith.js');
var ___cacheHas_js = require('./_cacheHas.js');
var ___createSet_js = require('./_createSet.js');
var ___setToArray_js = require('./_setToArray.js');

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 */
function baseUniq(array, iteratee, comparator) {
  var index = -1,
      includes = ___arrayIncludes_js.default,
      length = array.length,
      isCommon = true,
      result = [],
      seen = result;

  if (comparator) {
    isCommon = false;
    includes = ___arrayIncludesWith_js.default;
  }
  else if (length >= LARGE_ARRAY_SIZE) {
    var set = iteratee ? null : ___createSet_js.default(array);
    if (set) {
      return ___setToArray_js.default(set);
    }
    isCommon = false;
    includes = ___cacheHas_js.default;
    seen = new ___SetCache_js.default;
  }
  else {
    seen = iteratee ? [] : result;
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value) : value;

    value = (comparator || value !== 0) ? value : 0;
    if (isCommon && computed === computed) {
      var seenIndex = seen.length;
      while (seenIndex--) {
        if (seen[seenIndex] === computed) {
          continue outer;
        }
      }
      if (iteratee) {
        seen.push(computed);
      }
      result.push(value);
    }
    else if (!includes(seen, computed, comparator)) {
      if (seen !== result) {
        seen.push(computed);
      }
      result.push(value);
    }
  }
  return result;
}

module.exports = baseUniq;
