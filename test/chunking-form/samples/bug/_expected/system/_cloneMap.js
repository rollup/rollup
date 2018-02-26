System.register(['./_addMapEntry.js', './_arrayReduce.js', './_mapToArray.js'], function (exports, module) {
  'use strict';
  var addMapEntry, arrayReduce, mapToArray;
  return {
    setters: [function (module) {
      addMapEntry = module.default;
    }, function (module) {
      arrayReduce = module.default;
    }, function (module) {
      mapToArray = module.default;
    }],
    execute: function () {

      /** Used to compose bitmasks for cloning. */
      var CLONE_DEEP_FLAG = 1;

      /**
       * Creates a clone of `map`.
       *
       * @private
       * @param {Object} map The map to clone.
       * @param {Function} cloneFunc The function to clone values.
       * @param {boolean} [isDeep] Specify a deep clone.
       * @returns {Object} Returns the cloned map.
       */
      function cloneMap(map, isDeep, cloneFunc) {
        var array = isDeep ? cloneFunc(mapToArray(map), CLONE_DEEP_FLAG) : mapToArray(map);
        return arrayReduce(array, addMapEntry, new map.constructor);
      }
      exports('default', cloneMap);

    }
  };
});
