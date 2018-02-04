System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      /**
       * This method returns `true`.
       *
       * @static
       * @memberOf _
       * @since 4.13.0
       * @category Util
       * @returns {boolean} Returns `true`.
       * @example
       *
       * _.times(2, _.stubTrue);
       * // => [true, true]
       */
      function stubTrue() {
        return true;
      }
      exports('default', stubTrue);

    }
  };
});
