'use strict';

var __identity_js = require('./identity.js');

/**
 * Casts `value` to `identity` if it's not a function.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Function} Returns cast function.
 */
function castFunction(value) {
  return typeof value == 'function' ? value : __identity_js.default;
}

module.exports = castFunction;
