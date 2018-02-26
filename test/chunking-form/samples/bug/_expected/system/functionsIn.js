System.register(['./_baseFunctions.js', './keysIn.js'], function (exports, module) {
  'use strict';
  var baseFunctions, keysIn$1;
  return {
    setters: [function (module) {
      baseFunctions = module.default;
    }, function (module) {
      keysIn$1 = module.default;
    }],
    execute: function () {

      /**
       * Creates an array of function property names from own and inherited
       * enumerable properties of `object`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Object
       * @param {Object} object The object to inspect.
       * @returns {Array} Returns the function names.
       * @see _.functions
       * @example
       *
       * function Foo() {
       *   this.a = _.constant('a');
       *   this.b = _.constant('b');
       * }
       *
       * Foo.prototype.c = _.constant('c');
       *
       * _.functionsIn(new Foo);
       * // => ['a', 'b', 'c']
       */
      function functionsIn(object) {
        return object == null ? [] : baseFunctions(object, keysIn$1(object));
      }
      exports('functionsIn', functionsIn);

    }
  };
});
