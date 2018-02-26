System.register(['./_createMathOperation.js'], function (exports, module) {
  'use strict';
  var createMathOperation;
  return {
    setters: [function (module) {
      createMathOperation = module.default;
    }],
    execute: function () {

      /**
       * Adds two numbers.
       *
       * @static
       * @memberOf _
       * @since 3.4.0
       * @category Math
       * @param {number} augend The first number in an addition.
       * @param {number} addend The second number in an addition.
       * @returns {number} Returns the total.
       * @example
       *
       * _.add(6, 4);
       * // => 10
       */
      var add = createMathOperation(function(augend, addend) {
        return augend + addend;
      }, 0);
      exports('add', add);

    }
  };
});
