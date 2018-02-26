System.register(['./_root.js'], function (exports, module) {
  'use strict';
  var root;
  return {
    setters: [function (module) {
      root = module.default;
    }],
    execute: function () {

      /**
       * Gets the timestamp of the number of milliseconds that have elapsed since
       * the Unix epoch (1 January 1970 00:00:00 UTC).
       *
       * @static
       * @memberOf _
       * @since 2.4.0
       * @category Date
       * @returns {number} Returns the timestamp.
       * @example
       *
       * _.defer(function(stamp) {
       *   console.log(_.now() - stamp);
       * }, _.now());
       * // => Logs the number of milliseconds it took for the deferred invocation.
       */
      var now = function() {
        return root.Date.now();
      };
      exports('default', now);

    }
  };
});
