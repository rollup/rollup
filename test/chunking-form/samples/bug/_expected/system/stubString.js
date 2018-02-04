System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      /**
       * This method returns an empty string.
       *
       * @static
       * @memberOf _
       * @since 4.13.0
       * @category Util
       * @returns {string} Returns the empty string.
       * @example
       *
       * _.times(2, _.stubString);
       * // => ['', '']
       */
      function stubString() {
        return '';
      }
      exports('default', stubString);

    }
  };
});
