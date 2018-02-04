System.register(['./_baseRange.js', './_isIterateeCall.js', './toFinite.js'], function (exports, module) {
  'use strict';
  var baseRange, isIterateeCall, toFinite;
  return {
    setters: [function (module) {
      baseRange = module.default;
    }, function (module) {
      isIterateeCall = module.default;
    }, function (module) {
      toFinite = module.default;
    }],
    execute: function () {

      /**
       * Creates a `_.range` or `_.rangeRight` function.
       *
       * @private
       * @param {boolean} [fromRight] Specify iterating from right to left.
       * @returns {Function} Returns the new range function.
       */
      function createRange(fromRight) {
        return function(start, end, step) {
          if (step && typeof step != 'number' && isIterateeCall(start, end, step)) {
            end = step = undefined;
          }
          // Ensure the sign of `-0` is preserved.
          start = toFinite(start);
          if (end === undefined) {
            end = start;
            start = 0;
          } else {
            end = toFinite(end);
          }
          step = step === undefined ? (start < end ? 1 : -1) : toFinite(step);
          return baseRange(start, end, step, fromRight);
        };
      }
      exports('default', createRange);

    }
  };
});
