System.register(['./_baseForRight.js', './_castFunction.js', './keysIn.js'], function (exports, module) {
  'use strict';
  var baseForRight, castFunction, keysIn$1;
  return {
    setters: [function (module) {
      baseForRight = module.default;
    }, function (module) {
      castFunction = module.default;
    }, function (module) {
      keysIn$1 = module.default;
    }],
    execute: function () {

      /**
       * This method is like `_.forIn` except that it iterates over properties of
       * `object` in the opposite order.
       *
       * @static
       * @memberOf _
       * @since 2.0.0
       * @category Object
       * @param {Object} object The object to iterate over.
       * @param {Function} [iteratee=_.identity] The function invoked per iteration.
       * @returns {Object} Returns `object`.
       * @see _.forIn
       * @example
       *
       * function Foo() {
       *   this.a = 1;
       *   this.b = 2;
       * }
       *
       * Foo.prototype.c = 3;
       *
       * _.forInRight(new Foo, function(value, key) {
       *   console.log(key);
       * });
       * // => Logs 'c', 'b', then 'a' assuming `_.forIn` logs 'a', 'b', then 'c'.
       */
      function forInRight(object, iteratee) {
        return object == null
          ? object
          : baseForRight(object, castFunction(iteratee), keysIn$1);
      }
      exports('forInRight', forInRight);

    }
  };
});
