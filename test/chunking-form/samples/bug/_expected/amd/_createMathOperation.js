define(['./_baseToNumber.js', './_baseToString.js'], function (___baseToNumber_js, ___baseToString_js) { 'use strict';

  /**
   * Creates a function that performs a mathematical operation on two values.
   *
   * @private
   * @param {Function} operator The function to perform the operation.
   * @param {number} [defaultValue] The value used for `undefined` arguments.
   * @returns {Function} Returns the new mathematical operation function.
   */
  function createMathOperation(operator, defaultValue) {
    return function(value, other) {
      var result;
      if (value === undefined && other === undefined) {
        return defaultValue;
      }
      if (value !== undefined) {
        result = value;
      }
      if (other !== undefined) {
        if (result === undefined) {
          return other;
        }
        if (typeof value == 'string' || typeof other == 'string') {
          value = ___baseToString_js.default(value);
          other = ___baseToString_js.default(other);
        } else {
          value = ___baseToNumber_js.default(value);
          other = ___baseToNumber_js.default(other);
        }
        result = operator(value, other);
      }
      return result;
    };
  }

  return createMathOperation;

});
