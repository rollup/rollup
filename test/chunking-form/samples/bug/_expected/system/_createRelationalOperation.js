System.register(['./toNumber.js'], function (exports, module) {
  'use strict';
  var toNumber;
  return {
    setters: [function (module) {
      toNumber = module.default;
    }],
    execute: function () {

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
            value = toNumber(value);
            other = toNumber(other);
          }
          return operator(value, other);
        };
      }
      exports('default', createRelationalOperation);

    }
  };
});
