System.register(['./_metaMap.js', './noop.js'], function (exports, module) {
  'use strict';
  var metaMap, noop;
  return {
    setters: [function (module) {
      metaMap = module.default;
    }, function (module) {
      noop = module.default;
    }],
    execute: function () {

      /**
       * Gets metadata for `func`.
       *
       * @private
       * @param {Function} func The function to query.
       * @returns {*} Returns the metadata for `func`.
       */
      var getData = !metaMap ? noop : function(func) {
        return metaMap.get(func);
      };
      exports('default', getData);

    }
  };
});
