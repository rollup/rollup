System.register(['./_baseInverter.js'], function (exports, module) {
  'use strict';
  var baseInverter;
  return {
    setters: [function (module) {
      baseInverter = module.default;
    }],
    execute: function () {

      /**
       * Creates a function like `_.invertBy`.
       *
       * @private
       * @param {Function} setter The function to set accumulator values.
       * @param {Function} toIteratee The function to resolve iteratees.
       * @returns {Function} Returns the new inverter function.
       */
      function createInverter(setter, toIteratee) {
        return function(object, iteratee) {
          return baseInverter(object, setter, toIteratee(iteratee), {});
        };
      }
      exports('default', createInverter);

    }
  };
});
