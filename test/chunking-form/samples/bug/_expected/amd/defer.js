define(['./_baseDelay.js', './_baseRest.js'], function (___baseDelay_js, ___baseRest_js) { 'use strict';

  /**
   * Defers invoking the `func` until the current call stack has cleared. Any
   * additional arguments are provided to `func` when it's invoked.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to defer.
   * @param {...*} [args] The arguments to invoke `func` with.
   * @returns {number} Returns the timer id.
   * @example
   *
   * _.defer(function(text) {
   *   console.log(text);
   * }, 'deferred');
   * // => Logs 'deferred' after one millisecond.
   */
  var defer = ___baseRest_js.default(function(func, args) {
    return ___baseDelay_js.default(func, 1, args);
  });

  return defer;

});
