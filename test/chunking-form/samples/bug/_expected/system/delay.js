System.register(['./_baseDelay.js', './_baseRest.js', './toNumber.js'], function (exports, module) {
  'use strict';
  var baseDelay, baseRest, toNumber;
  return {
    setters: [function (module) {
      baseDelay = module.default;
    }, function (module) {
      baseRest = module.default;
    }, function (module) {
      toNumber = module.default;
    }],
    execute: function () {

      /**
       * Invokes `func` after `wait` milliseconds. Any additional arguments are
       * provided to `func` when it's invoked.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Function
       * @param {Function} func The function to delay.
       * @param {number} wait The number of milliseconds to delay invocation.
       * @param {...*} [args] The arguments to invoke `func` with.
       * @returns {number} Returns the timer id.
       * @example
       *
       * _.delay(function(text) {
       *   console.log(text);
       * }, 1000, 'later');
       * // => Logs 'later' after one second.
       */
      var delay = baseRest(function(func, wait, args) {
        return baseDelay(func, toNumber(wait) || 0, args);
      });
      exports('delay', delay);

    }
  };
});
