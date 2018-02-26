System.register(['./_arrayMap.js', './_baseIteratee.js', './_basePickBy.js', './_getAllKeysIn.js'], function (exports, module) {
  'use strict';
  var arrayMap, baseIteratee, basePickBy, getAllKeysIn;
  return {
    setters: [function (module) {
      arrayMap = module.default;
    }, function (module) {
      baseIteratee = module.default;
    }, function (module) {
      basePickBy = module.default;
    }, function (module) {
      getAllKeysIn = module.default;
    }],
    execute: function () {

      /**
       * Creates an object composed of the `object` properties `predicate` returns
       * truthy for. The predicate is invoked with two arguments: (value, key).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Object
       * @param {Object} object The source object.
       * @param {Function} [predicate=_.identity] The function invoked per property.
       * @returns {Object} Returns the new object.
       * @example
       *
       * var object = { 'a': 1, 'b': '2', 'c': 3 };
       *
       * _.pickBy(object, _.isNumber);
       * // => { 'a': 1, 'c': 3 }
       */
      function pickBy(object, predicate) {
        if (object == null) {
          return {};
        }
        var props = arrayMap(getAllKeysIn(object), function(prop) {
          return [prop];
        });
        predicate = baseIteratee(predicate);
        return basePickBy(object, props, function(value, path) {
          return predicate(value, path[0]);
        });
      }
      exports('default', pickBy);

    }
  };
});
