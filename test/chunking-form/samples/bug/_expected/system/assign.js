System.register(['./_assignValue.js', './_copyObject.js', './_createAssigner.js', './isArrayLike.js', './_isPrototype.js', './keys.js'], function (exports, module) {
  'use strict';
  var assignValue, copyObject, createAssigner, isArrayLike, isPrototype, keys;
  return {
    setters: [function (module) {
      assignValue = module.default;
    }, function (module) {
      copyObject = module.default;
    }, function (module) {
      createAssigner = module.default;
    }, function (module) {
      isArrayLike = module.default;
    }, function (module) {
      isPrototype = module.default;
    }, function (module) {
      keys = module.default;
    }],
    execute: function () {

      /** Used for built-in method references. */
      var objectProto = Object.prototype;

      /** Used to check objects for own properties. */
      var hasOwnProperty = objectProto.hasOwnProperty;

      /**
       * Assigns own enumerable string keyed properties of source objects to the
       * destination object. Source objects are applied from left to right.
       * Subsequent sources overwrite property assignments of previous sources.
       *
       * **Note:** This method mutates `object` and is loosely based on
       * [`Object.assign`](https://mdn.io/Object/assign).
       *
       * @static
       * @memberOf _
       * @since 0.10.0
       * @category Object
       * @param {Object} object The destination object.
       * @param {...Object} [sources] The source objects.
       * @returns {Object} Returns `object`.
       * @see _.assignIn
       * @example
       *
       * function Foo() {
       *   this.a = 1;
       * }
       *
       * function Bar() {
       *   this.c = 3;
       * }
       *
       * Foo.prototype.b = 2;
       * Bar.prototype.d = 4;
       *
       * _.assign({ 'a': 0 }, new Foo, new Bar);
       * // => { 'a': 1, 'c': 3 }
       */
      var assign = createAssigner(function(object, source) {
        if (isPrototype(source) || isArrayLike(source)) {
          copyObject(source, keys(source), object);
          return;
        }
        for (var key in source) {
          if (hasOwnProperty.call(source, key)) {
            assignValue(object, key, source[key]);
          }
        }
      });
      exports('assign', assign);

    }
  };
});
