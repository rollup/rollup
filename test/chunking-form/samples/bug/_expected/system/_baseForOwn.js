System.register(['./_baseFor.js', './keys.js'], function (exports, module) {
  'use strict';
  var baseFor, keys;
  return {
    setters: [function (module) {
      baseFor = module.default;
    }, function (module) {
      keys = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `_.forOwn` without support for iteratee shorthands.
       *
       * @private
       * @param {Object} object The object to iterate over.
       * @param {Function} iteratee The function invoked per iteration.
       * @returns {Object} Returns `object`.
       */
      function baseForOwn(object, iteratee) {
        return object && baseFor(object, iteratee, keys);
      }
      exports('default', baseForOwn);

    }
  };
});
