define(['./_baseNth.js', './_baseRest.js', './toInteger.js'], function (___baseNth_js, ___baseRest_js, __toInteger_js) { 'use strict';

  /**
   * Creates a function that gets the argument at index `n`. If `n` is negative,
   * the nth argument from the end is returned.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Util
   * @param {number} [n=0] The index of the argument to return.
   * @returns {Function} Returns the new pass-thru function.
   * @example
   *
   * var func = _.nthArg(1);
   * func('a', 'b', 'c', 'd');
   * // => 'b'
   *
   * var func = _.nthArg(-2);
   * func('a', 'b', 'c', 'd');
   * // => 'c'
   */
  function nthArg(n) {
    n = __toInteger_js.default(n);
    return ___baseRest_js.default(function(args) {
      return ___baseNth_js.default(args, n);
    });
  }

  return nthArg;

});
