System.register(['./_isKeyable.js'], function (exports, module) {
  'use strict';
  var isKeyable;
  return {
    setters: [function (module) {
      isKeyable = module.default;
    }],
    execute: function () {

      /**
       * Gets the data for `map`.
       *
       * @private
       * @param {Object} map The map to query.
       * @param {string} key The reference key.
       * @returns {*} Returns the map data.
       */
      function getMapData(map, key) {
        var data = map.__data__;
        return isKeyable(key)
          ? data[typeof key == 'string' ? 'string' : 'hash']
          : data.map;
      }
      exports('default', getMapData);

    }
  };
});
