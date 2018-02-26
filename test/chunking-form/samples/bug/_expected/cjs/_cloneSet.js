'use strict';

var ___addSetEntry_js = require('./_addSetEntry.js');
var ___arrayReduce_js = require('./_arrayReduce.js');
var ___setToArray_js = require('./_setToArray.js');

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1;

/**
 * Creates a clone of `set`.
 *
 * @private
 * @param {Object} set The set to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned set.
 */
function cloneSet(set, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(___setToArray_js.default(set), CLONE_DEEP_FLAG) : ___setToArray_js.default(set);
  return ___arrayReduce_js.default(array, ___addSetEntry_js.default, new set.constructor);
}

module.exports = cloneSet;
