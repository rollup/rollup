'use strict';

var ___baseSetToString_js = require('./_baseSetToString.js');
var ___shortOut_js = require('./_shortOut.js');

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = ___shortOut_js.default(___baseSetToString_js.default);

module.exports = setToString;
