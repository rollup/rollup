System.register(['./_baseEach.js'], function (exports, module) {
  'use strict';
  var baseEach;
  return {
    setters: [function (module) {
      baseEach = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `_.filter` without support for iteratee shorthands.
       *
       * @private
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} predicate The function invoked per iteration.
       * @returns {Array} Returns the new filtered array.
       */
      function baseFilter(collection, predicate) {
        var result = [];
        baseEach(collection, function(value, index, collection) {
          if (predicate(value, index, collection)) {
            result.push(value);
          }
        });
        return result;
      }
      exports('default', baseFilter);

    }
  };
});
