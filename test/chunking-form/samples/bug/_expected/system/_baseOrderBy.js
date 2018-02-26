System.register(['./_arrayMap.js', './_baseIteratee.js', './_baseMap.js', './_baseSortBy.js', './_baseUnary.js', './_compareMultiple.js', './identity.js'], function (exports, module) {
  'use strict';
  var arrayMap, baseIteratee, baseMap, baseSortBy, baseUnary, compareMultiple, identity;
  return {
    setters: [function (module) {
      arrayMap = module.default;
    }, function (module) {
      baseIteratee = module.default;
    }, function (module) {
      baseMap = module.default;
    }, function (module) {
      baseSortBy = module.default;
    }, function (module) {
      baseUnary = module.default;
    }, function (module) {
      compareMultiple = module.default;
    }, function (module) {
      identity = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `_.orderBy` without param guards.
       *
       * @private
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
       * @param {string[]} orders The sort orders of `iteratees`.
       * @returns {Array} Returns the new sorted array.
       */
      function baseOrderBy(collection, iteratees, orders) {
        var index = -1;
        iteratees = arrayMap(iteratees.length ? iteratees : [identity], baseUnary(baseIteratee));

        var result = baseMap(collection, function(value, key, collection) {
          var criteria = arrayMap(iteratees, function(iteratee) {
            return iteratee(value);
          });
          return { 'criteria': criteria, 'index': ++index, 'value': value };
        });

        return baseSortBy(result, function(object, other) {
          return compareMultiple(object, other, orders);
        });
      }
      exports('default', baseOrderBy);

    }
  };
});
