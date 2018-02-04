System.register(['./_arrayMap.js', './_copyArray.js', './isArray.js', './isSymbol.js', './_stringToPath.js', './_toKey.js', './toString.js'], function (exports, module) {
  'use strict';
  var arrayMap, copyArray, isArray, isSymbol, stringToPath, toKey, toString;
  return {
    setters: [function (module) {
      arrayMap = module.default;
    }, function (module) {
      copyArray = module.default;
    }, function (module) {
      isArray = module.default;
    }, function (module) {
      isSymbol = module.default;
    }, function (module) {
      stringToPath = module.default;
    }, function (module) {
      toKey = module.default;
    }, function (module) {
      toString = module.default;
    }],
    execute: function () {

      /**
       * Converts `value` to a property path array.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Util
       * @param {*} value The value to convert.
       * @returns {Array} Returns the new property path array.
       * @example
       *
       * _.toPath('a.b.c');
       * // => ['a', 'b', 'c']
       *
       * _.toPath('a[0].b.c');
       * // => ['a', '0', 'b', 'c']
       */
      function toPath(value) {
        if (isArray(value)) {
          return arrayMap(value, toKey);
        }
        return isSymbol(value) ? [value] : copyArray(stringToPath(toString(value)));
      }
      exports('default', toPath);

    }
  };
});
