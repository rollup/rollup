System.register(['./_baseProperty.js', './_basePropertyDeep.js', './_isKey.js', './_toKey.js'], function (exports, module) {
  'use strict';
  var baseProperty, basePropertyDeep, isKey, toKey;
  return {
    setters: [function (module) {
      baseProperty = module.default;
    }, function (module) {
      basePropertyDeep = module.default;
    }, function (module) {
      isKey = module.default;
    }, function (module) {
      toKey = module.default;
    }],
    execute: function () {

      /**
       * Creates a function that returns the value at `path` of a given object.
       *
       * @static
       * @memberOf _
       * @since 2.4.0
       * @category Util
       * @param {Array|string} path The path of the property to get.
       * @returns {Function} Returns the new accessor function.
       * @example
       *
       * var objects = [
       *   { 'a': { 'b': 2 } },
       *   { 'a': { 'b': 1 } }
       * ];
       *
       * _.map(objects, _.property('a.b'));
       * // => [2, 1]
       *
       * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
       * // => [1, 2]
       */
      function property(path) {
        return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
      }
      exports('default', property);

    }
  };
});
