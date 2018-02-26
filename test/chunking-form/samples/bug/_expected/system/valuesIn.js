System.register(['./_baseValues.js', './keysIn.js'], function (exports, module) {
  'use strict';
  var baseValues, keysIn$1;
  return {
    setters: [function (module) {
      baseValues = module.default;
    }, function (module) {
      keysIn$1 = module.default;
    }],
    execute: function () {

      /**
       * Creates an array of the own and inherited enumerable string keyed property
       * values of `object`.
       *
       * **Note:** Non-object values are coerced to objects.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Object
       * @param {Object} object The object to query.
       * @returns {Array} Returns the array of property values.
       * @example
       *
       * function Foo() {
       *   this.a = 1;
       *   this.b = 2;
       * }
       *
       * Foo.prototype.c = 3;
       *
       * _.valuesIn(new Foo);
       * // => [1, 2, 3] (iteration order is not guaranteed)
       */
      function valuesIn(object) {
        return object == null ? [] : baseValues(object, keysIn$1(object));
      }
      exports('default', valuesIn);

    }
  };
});
