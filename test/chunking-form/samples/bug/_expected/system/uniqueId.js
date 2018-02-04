System.register(['./toString.js'], function (exports, module) {
  'use strict';
  var toString;
  return {
    setters: [function (module) {
      toString = module.default;
    }],
    execute: function () {

      /** Used to generate unique IDs. */
      var idCounter = 0;

      /**
       * Generates a unique ID. If `prefix` is given, the ID is appended to it.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Util
       * @param {string} [prefix=''] The value to prefix the ID with.
       * @returns {string} Returns the unique ID.
       * @example
       *
       * _.uniqueId('contact_');
       * // => 'contact_104'
       *
       * _.uniqueId();
       * // => '105'
       */
      function uniqueId(prefix) {
        var id = ++idCounter;
        return toString(prefix) + id;
      }
      exports('default', uniqueId);

    }
  };
});
