define(['./_apply.js', './_arrayMap.js', './_baseFlatten.js', './_baseIteratee.js', './_baseRest.js', './_baseUnary.js', './_castRest.js', './isArray.js'], function (___apply_js, ___arrayMap_js, ___baseFlatten_js, ___baseIteratee_js, ___baseRest_js, ___baseUnary_js, ___castRest_js, __isArray_js) { 'use strict';

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
  var overArgs = ___castRest_js.default(function(func, transforms) {
    transforms = (transforms.length == 1 && __isArray_js.default(transforms[0]))
      ? ___arrayMap_js.default(transforms[0], ___baseUnary_js.default(___baseIteratee_js.default))
      : ___arrayMap_js.default(___baseFlatten_js.default(transforms, 1), ___baseUnary_js.default(___baseIteratee_js.default));

    var funcsLength = transforms.length;
    return ___baseRest_js.default(function(args) {
      var index = -1,
          length = nativeMin(args.length, funcsLength);

      while (++index < length) {
        args[index] = transforms[index].call(this, args[index]);
      }
      return ___apply_js.default(func, this, args);
    });
  });

  return overArgs;

});
