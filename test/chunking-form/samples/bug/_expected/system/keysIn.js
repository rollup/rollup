System.register(['./_arrayLikeKeys.js', './_baseKeysIn.js', './isArrayLike.js'], function (exports, module) {
  'use strict';
  var arrayLikeKeys, baseKeysIn, isArrayLike;
  return {
    setters: [function (module) {
      arrayLikeKeys = module.default;
    }, function (module) {
      baseKeysIn = module.default;
    }, function (module) {
      isArrayLike = module.default;
    }],
    execute: function () {

      /**
       * Creates an array of the own and inherited enumerable property names of `object`.
       *
       * **Note:** Non-object values are coerced to objects.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Object
       * @param {Object} object The object to query.
       * @returns {Array} Returns the array of property names.
       * @example
       *
       * function Foo() {
       *   this.a = 1;
       *   this.b = 2;
       * }
       *
       * Foo.prototype.c = 3;
       *
       * _.keysIn(new Foo);
       * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
       */
      function keysIn$1(object) {
        return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
      }
      exports('keysIn', keysIn$1);

    }
  };
});
