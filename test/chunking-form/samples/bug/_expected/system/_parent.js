System.register(['./_baseGet.js', './_baseSlice.js'], function (exports, module) {
  'use strict';
  var baseGet, baseSlice;
  return {
    setters: [function (module) {
      baseGet = module.default;
    }, function (module) {
      baseSlice = module.default;
    }],
    execute: function () {

      /**
       * Gets the parent value at `path` of `object`.
       *
       * @private
       * @param {Object} object The object to query.
       * @param {Array} path The path to get the parent value of.
       * @returns {*} Returns the parent value.
       */
      function parent(object, path) {
        return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
      }
      exports('default', parent);

    }
  };
});
