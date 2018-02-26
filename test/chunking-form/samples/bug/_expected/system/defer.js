System.register(['./_baseDelay.js', './_baseRest.js'], function (exports, module) {
  'use strict';
  var baseDelay, baseRest;
  return {
    setters: [function (module) {
      baseDelay = module.default;
    }, function (module) {
      baseRest = module.default;
    }],
    execute: function () {

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
      var defer = baseRest(function(func, args) {
        return baseDelay(func, 1, args);
      });
      exports('defer', defer);

    }
  };
});
