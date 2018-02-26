System.register(['./_Symbol.js', './_copyArray.js', './_getTag.js', './isArrayLike.js', './isString.js', './_iteratorToArray.js', './_mapToArray.js', './_setToArray.js', './_stringToArray.js', './values.js'], function (exports, module) {
  'use strict';
  var Symbol, copyArray, getTag, isArrayLike, isString, iteratorToArray, mapToArray, setToArray, stringToArray, values;
  return {
    setters: [function (module) {
      Symbol = module.default;
    }, function (module) {
      copyArray = module.default;
    }, function (module) {
      getTag = module.default;
    }, function (module) {
      isArrayLike = module.default;
    }, function (module) {
      isString = module.default;
    }, function (module) {
      iteratorToArray = module.default;
    }, function (module) {
      mapToArray = module.default;
    }, function (module) {
      setToArray = module.default;
    }, function (module) {
      stringToArray = module.default;
    }, function (module) {
      values = module.default;
    }],
    execute: function () {

      /** `Object#toString` result references. */
      var mapTag = '[object Map]',
          setTag = '[object Set]';

      /** Built-in value references. */
      var symIterator = Symbol ? Symbol.iterator : undefined;

      /**
       * Converts `value` to an array.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Lang
       * @param {*} value The value to convert.
       * @returns {Array} Returns the converted array.
       * @example
       *
       * _.toArray({ 'a': 1, 'b': 2 });
       * // => [1, 2]
       *
       * _.toArray('abc');
       * // => ['a', 'b', 'c']
       *
       * _.toArray(1);
       * // => []
       *
       * _.toArray(null);
       * // => []
       */
      function toArray(value) {
        if (!value) {
          return [];
        }
        if (isArrayLike(value)) {
          return isString(value) ? stringToArray(value) : copyArray(value);
        }
        if (symIterator && value[symIterator]) {
          return iteratorToArray(value[symIterator]());
        }
        var tag = getTag(value),
            func = tag == mapTag ? mapToArray : (tag == setTag ? setToArray : values);

        return func(value);
      }
      exports('default', toArray);

    }
  };
});
