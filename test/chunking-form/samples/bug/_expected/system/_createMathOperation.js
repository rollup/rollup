System.register(['./_baseToNumber.js', './_baseToString.js'], function (exports, module) {
  'use strict';
  var baseToNumber, baseToString;
  return {
    setters: [function (module) {
      baseToNumber = module.default;
    }, function (module) {
      baseToString = module.default;
    }],
    execute: function () {

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
              value = baseToString(value);
              other = baseToString(other);
            } else {
              value = baseToNumber(value);
              other = baseToNumber(other);
            }
            result = operator(value, other);
          }
          return result;
        };
      }
      exports('default', createMathOperation);

    }
  };
});
