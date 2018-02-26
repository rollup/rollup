System.register(['./_baseKeys.js', './_getTag.js', './isArrayLike.js', './isString.js', './_stringSize.js'], function (exports, module) {
  'use strict';
  var baseKeys, getTag, isArrayLike, isString, stringSize;
  return {
    setters: [function (module) {
      baseKeys = module.default;
    }, function (module) {
      getTag = module.default;
    }, function (module) {
      isArrayLike = module.default;
    }, function (module) {
      isString = module.default;
    }, function (module) {
      stringSize = module.default;
    }],
    execute: function () {

      /** `Object#toString` result references. */
      var mapTag = '[object Map]',
          setTag = '[object Set]';

      /**
       * Gets the size of `collection` by returning its length for array-like
       * values or the number of own enumerable string keyed properties for objects.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Collection
       * @param {Array|Object|string} collection The collection to inspect.
       * @returns {number} Returns the collection size.
       * @example
       *
       * _.size([1, 2, 3]);
       * // => 3
       *
       * _.size({ 'a': 1, 'b': 2 });
       * // => 2
       *
       * _.size('pebbles');
       * // => 7
       */
      function size(collection) {
        if (collection == null) {
          return 0;
        }
        if (isArrayLike(collection)) {
          return isString(collection) ? stringSize(collection) : collection.length;
        }
        var tag = getTag(collection);
        if (tag == mapTag || tag == setTag) {
          return collection.size;
        }
        return baseKeys(collection).length;
      }
      exports('default', size);

    }
  };
});
