System.register(['./_baseGet.js', './_baseSet.js'], function (exports, module) {
  'use strict';
  var baseGet, baseSet;
  return {
    setters: [function (module) {
      baseGet = module.default;
    }, function (module) {
      baseSet = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `_.update`.
       *
       * @private
       * @param {Object} object The object to modify.
       * @param {Array|string} path The path of the property to update.
       * @param {Function} updater The function to produce the updated value.
       * @param {Function} [customizer] The function to customize path creation.
       * @returns {Object} Returns `object`.
       */
      function baseUpdate(object, path, updater, customizer) {
        return baseSet(object, path, updater(baseGet(object, path)), customizer);
      }
      exports('default', baseUpdate);

    }
  };
});
