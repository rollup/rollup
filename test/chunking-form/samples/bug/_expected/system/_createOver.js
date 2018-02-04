System.register(['./_apply.js', './_arrayMap.js', './_baseIteratee.js', './_baseRest.js', './_baseUnary.js', './_flatRest.js'], function (exports, module) {
  'use strict';
  var apply, arrayMap, baseIteratee, baseRest, baseUnary, flatRest;
  return {
    setters: [function (module) {
      apply = module.default;
    }, function (module) {
      arrayMap = module.default;
    }, function (module) {
      baseIteratee = module.default;
    }, function (module) {
      baseRest = module.default;
    }, function (module) {
      baseUnary = module.default;
    }, function (module) {
      flatRest = module.default;
    }],
    execute: function () {

      /**
       * Creates a function like `_.over`.
       *
       * @private
       * @param {Function} arrayFunc The function to iterate over iteratees.
       * @returns {Function} Returns the new over function.
       */
      function createOver(arrayFunc) {
        return flatRest(function(iteratees) {
          iteratees = arrayMap(iteratees, baseUnary(baseIteratee));
          return baseRest(function(args) {
            var thisArg = this;
            return arrayFunc(iteratees, function(iteratee) {
              return apply(iteratee, thisArg, args);
            });
          });
        });
      }
      exports('default', createOver);

    }
  };
});
