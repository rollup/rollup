System.register(['./_apply.js', './_arrayPush.js', './_baseRest.js', './_castSlice.js', './toInteger.js'], function (exports, module) {
  'use strict';
  var apply, arrayPush, baseRest, castSlice, toInteger;
  return {
    setters: [function (module) {
      apply = module.default;
    }, function (module) {
      arrayPush = module.default;
    }, function (module) {
      baseRest = module.default;
    }, function (module) {
      castSlice = module.default;
    }, function (module) {
      toInteger = module.default;
    }],
    execute: function () {

      /** Error message constants. */
      var FUNC_ERROR_TEXT = 'Expected a function';

      /* Built-in method references for those with the same name as other `lodash` methods. */
      var nativeMax = Math.max;

      /**
       * Creates a function that invokes `func` with the `this` binding of the
       * create function and an array of arguments much like
       * [`Function#apply`](http://www.ecma-international.org/ecma-262/7.0/#sec-function.prototype.apply).
       *
       * **Note:** This method is based on the
       * [spread operator](https://mdn.io/spread_operator).
       *
       * @static
       * @memberOf _
       * @since 3.2.0
       * @category Function
       * @param {Function} func The function to spread arguments over.
       * @param {number} [start=0] The start position of the spread.
       * @returns {Function} Returns the new function.
       * @example
       *
       * var say = _.spread(function(who, what) {
       *   return who + ' says ' + what;
       * });
       *
       * say(['fred', 'hello']);
       * // => 'fred says hello'
       *
       * var numbers = Promise.all([
       *   Promise.resolve(40),
       *   Promise.resolve(36)
       * ]);
       *
       * numbers.then(_.spread(function(x, y) {
       *   return x + y;
       * }));
       * // => a Promise of 76
       */
      function spread(func, start) {
        if (typeof func != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        start = start == null ? 0 : nativeMax(toInteger(start), 0);
        return baseRest(function(args) {
          var array = args[start],
              otherArgs = castSlice(args, 0, start);

          if (array) {
            arrayPush(otherArgs, array);
          }
          return apply(func, this, otherArgs);
        });
      }
      exports('default', spread);

    }
  };
});
