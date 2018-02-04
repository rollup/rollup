System.register(['./isPlainObject.js'], function (exports, module) {
  'use strict';
  var isPlainObject;
  return {
    setters: [function (module) {
      isPlainObject = module.default;
    }],
    execute: function () {

      /**
       * Used by `_.omit` to customize its `_.cloneDeep` use to only clone plain
       * objects.
       *
       * @private
       * @param {*} value The value to inspect.
       * @param {string} key The key of the property to inspect.
       * @returns {*} Returns the uncloned value or `undefined` to defer cloning to `_.cloneDeep`.
       */
      function customOmitClone(value) {
        return isPlainObject(value) ? undefined : value;
      }
      exports('default', customOmitClone);

    }
  };
});
