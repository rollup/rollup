'use strict';

var ___baseGetTag_js = require('./_baseGetTag.js');
var __isObjectLike_js = require('./isObjectLike.js');

/** `Object#toString` result references. */
var dateTag = '[object Date]';

/**
 * The base implementation of `_.isDate` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a date object, else `false`.
 */
function baseIsDate(value) {
  return __isObjectLike_js.default(value) && ___baseGetTag_js.default(value) == dateTag;
}

module.exports = baseIsDate;
