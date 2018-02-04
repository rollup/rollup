System.register(['./_baseForRight.js', './keys.js'], function (exports, module) {
  'use strict';
  var baseForRight, keys;
  return {
    setters: [function (module) {
      baseForRight = module.default;
    }, function (module) {
      keys = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `_.forOwnRight` without support for iteratee shorthands.
       *
       * @private
       * @param {Object} object The object to iterate over.
       * @param {Function} iteratee The function invoked per iteration.
       * @returns {Object} Returns `object`.
       */
      function baseForOwnRight(object, iteratee) {
        return object && baseForRight(object, iteratee, keys);
      }
      exports('default', baseForOwnRight);

    }
  };
});
