'use strict';

var ___baseWrapperValue_js = require('./_baseWrapperValue.js');

/**
 * Executes the chain sequence to resolve the unwrapped value.
 *
 * @name value
 * @memberOf _
 * @since 0.1.0
 * @alias toJSON, valueOf
 * @category Seq
 * @returns {*} Returns the resolved unwrapped value.
 * @example
 *
 * _([1, 2, 3]).value();
 * // => [1, 2, 3]
 */
function wrapperValue() {
  return ___baseWrapperValue_js.default(this.__wrapped__, this.__actions__);
}

module.exports = wrapperValue;
