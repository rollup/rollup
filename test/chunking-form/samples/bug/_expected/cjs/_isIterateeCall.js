'use strict';

var __eq_js = require('./eq.js');
var __isArrayLike_js = require('./isArrayLike.js');
var ___isIndex_js = require('./_isIndex.js');
var __isObject_js = require('./isObject.js');

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!__isObject_js.default(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (__isArrayLike_js.default(object) && ___isIndex_js.default(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return __eq_js.default(object[index], value);
  }
  return false;
}

module.exports = isIterateeCall;
