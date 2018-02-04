'use strict';

var ___baseToPairs_js = require('./_baseToPairs.js');
var ___getTag_js = require('./_getTag.js');
var ___mapToArray_js = require('./_mapToArray.js');
var ___setToPairs_js = require('./_setToPairs.js');

/** `Object#toString` result references. */
var mapTag = '[object Map]',
    setTag = '[object Set]';

/**
 * Creates a `_.toPairs` or `_.toPairsIn` function.
 *
 * @private
 * @param {Function} keysFunc The function to get the keys of a given object.
 * @returns {Function} Returns the new pairs function.
 */
function createToPairs(keysFunc) {
  return function(object) {
    var tag = ___getTag_js.default(object);
    if (tag == mapTag) {
      return ___mapToArray_js.default(object);
    }
    if (tag == setTag) {
      return ___setToPairs_js.default(object);
    }
    return ___baseToPairs_js.default(object, keysFunc(object));
  };
}

module.exports = createToPairs;
