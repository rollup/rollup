System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      /**
       * This method returns `false`.
       *
       * @static
       * @memberOf _
       * @since 4.13.0
       * @category Util
       * @returns {boolean} Returns `false`.
       * @example
       *
       * _.times(2, _.stubFalse);
       * // => [false, false]
       */
      function stubFalse() {
        return false;
      }
      exports('default', stubFalse);

    }
  };
});
