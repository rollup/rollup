System.register(['./identity.js', './_metaMap.js'], function (exports, module) {
  'use strict';
  var identity, metaMap;
  return {
    setters: [function (module) {
      identity = module.default;
    }, function (module) {
      metaMap = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `setData` without support for hot loop shorting.
       *
       * @private
       * @param {Function} func The function to associate metadata with.
       * @param {*} data The metadata.
       * @returns {Function} Returns `func`.
       */
      var baseSetData = !metaMap ? identity : function(func, data) {
        metaMap.set(func, data);
        return func;
      };
      exports('default', baseSetData);

    }
  };
});
