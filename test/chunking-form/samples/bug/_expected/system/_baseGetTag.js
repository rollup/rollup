System.register(['./_Symbol.js', './_getRawTag.js', './_objectToString.js'], function (exports, module) {
  'use strict';
  var Symbol, getRawTag, objectToString;
  return {
    setters: [function (module) {
      Symbol = module.default;
    }, function (module) {
      getRawTag = module.default;
    }, function (module) {
      objectToString = module.default;
    }],
    execute: function () {

      /** `Object#toString` result references. */
      var nullTag = '[object Null]',
          undefinedTag = '[object Undefined]';

      /** Built-in value references. */
      var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

      /**
       * The base implementation of `getTag` without fallbacks for buggy environments.
       *
       * @private
       * @param {*} value The value to query.
       * @returns {string} Returns the `toStringTag`.
       */
      function baseGetTag(value) {
        if (value == null) {
          return value === undefined ? undefinedTag : nullTag;
        }
        return (symToStringTag && symToStringTag in Object(value))
          ? getRawTag(value)
          : objectToString(value);
      }
      exports('default', baseGetTag);

    }
  };
});
