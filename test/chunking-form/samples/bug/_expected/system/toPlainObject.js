System.register(['./_copyObject.js', './keysIn.js'], function (exports, module) {
  'use strict';
  var copyObject, keysIn$1;
  return {
    setters: [function (module) {
      copyObject = module.default;
    }, function (module) {
      keysIn$1 = module.default;
    }],
    execute: function () {

      /**
       * Converts `value` to a plain object flattening inherited enumerable string
       * keyed properties of `value` to own properties of the plain object.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Lang
       * @param {*} value The value to convert.
       * @returns {Object} Returns the converted plain object.
       * @example
       *
       * function Foo() {
       *   this.b = 2;
       * }
       *
       * Foo.prototype.c = 3;
       *
       * _.assign({ 'a': 1 }, new Foo);
       * // => { 'a': 1, 'b': 2 }
       *
       * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
       * // => { 'a': 1, 'b': 2, 'c': 3 }
       */
      function toPlainObject(value) {
        return copyObject(value, keysIn$1(value));
      }
      exports('default', toPlainObject);

    }
  };
});
