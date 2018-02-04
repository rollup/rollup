System.register(['./_apply.js', './_arrayMap.js', './_baseFlatten.js', './_baseIteratee.js', './_baseRest.js', './_baseUnary.js', './_castRest.js', './isArray.js'], function (exports, module) {
  'use strict';
  var apply, arrayMap, baseFlatten, baseIteratee, baseRest, baseUnary, castRest, isArray;
  return {
    setters: [function (module) {
      apply = module.default;
    }, function (module) {
      arrayMap = module.default;
    }, function (module) {
      baseFlatten = module.default;
    }, function (module) {
      baseIteratee = module.default;
    }, function (module) {
      baseRest = module.default;
    }, function (module) {
      baseUnary = module.default;
    }, function (module) {
      castRest = module.default;
    }, function (module) {
      isArray = module.default;
    }],
    execute: function () {

      /* Built-in method references for those with the same name as other `lodash` methods. */
      var nativeMin = Math.min;

      /**
       * Creates a function that invokes `func` with its arguments transformed.
       *
       * @static
       * @since 4.0.0
       * @memberOf _
       * @category Function
       * @param {Function} func The function to wrap.
       * @param {...(Function|Function[])} [transforms=[_.identity]]
       *  The argument transforms.
       * @returns {Function} Returns the new function.
       * @example
       *
       * function doubled(n) {
       *   return n * 2;
       * }
       *
       * function square(n) {
       *   return n * n;
       * }
       *
       * var func = _.overArgs(function(x, y) {
       *   return [x, y];
       * }, [square, doubled]);
       *
       * func(9, 3);
       * // => [81, 6]
       *
       * func(10, 5);
       * // => [100, 10]
       */
      var overArgs = castRest(function(func, transforms) {
        transforms = (transforms.length == 1 && isArray(transforms[0]))
          ? arrayMap(transforms[0], baseUnary(baseIteratee))
          : arrayMap(baseFlatten(transforms, 1), baseUnary(baseIteratee));

        var funcsLength = transforms.length;
        return baseRest(function(args) {
          var index = -1,
              length = nativeMin(args.length, funcsLength);

          while (++index < length) {
            args[index] = transforms[index].call(this, args[index]);
          }
          return apply(func, this, args);
        });
      });
      exports('default', overArgs);

    }
  };
});
