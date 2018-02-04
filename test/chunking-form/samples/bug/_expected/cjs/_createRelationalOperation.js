'use strict';

var __toNumber_js = require('./toNumber.js');

/**
 * Creates a function that performs a relational operation on two values.
 *
 * @private
 * @param {Function} operator The function to perform the operation.
 * @returns {Function} Returns the new relational operation function.
 */
function createRelationalOperation(operator) {
  return function(value, other) {
    if (!(typeof value == 'string' && typeof other == 'string')) {
      value = __toNumber_js.default(value);
      other = __toNumber_js.default(other);
    }
    return operator(value, other);
  };
}

module.exports = createRelationalOperation;
