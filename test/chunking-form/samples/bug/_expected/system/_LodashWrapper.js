System.register(['./_baseCreate.js', './_baseLodash.js'], function (exports, module) {
  'use strict';
  var baseCreate, baseLodash;
  return {
    setters: [function (module) {
      baseCreate = module.default;
    }, function (module) {
      baseLodash = module.default;
    }],
    execute: function () {

      /**
       * The base constructor for creating `lodash` wrapper objects.
       *
       * @private
       * @param {*} value The value to wrap.
       * @param {boolean} [chainAll] Enable explicit method chain sequences.
       */
      function LodashWrapper(value, chainAll) {
        this.__wrapped__ = value;
        this.__actions__ = [];
        this.__chain__ = !!chainAll;
        this.__index__ = 0;
        this.__values__ = undefined;
      }

      LodashWrapper.prototype = baseCreate(baseLodash.prototype);
      LodashWrapper.prototype.constructor = LodashWrapper;
      exports('default', LodashWrapper);

    }
  };
});
