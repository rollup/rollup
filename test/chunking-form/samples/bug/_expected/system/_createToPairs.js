System.register(['./_baseToPairs.js', './_getTag.js', './_mapToArray.js', './_setToPairs.js'], function (exports, module) {
  'use strict';
  var baseToPairs, getTag, mapToArray, setToPairs;
  return {
    setters: [function (module) {
      baseToPairs = module.default;
    }, function (module) {
      getTag = module.default;
    }, function (module) {
      mapToArray = module.default;
    }, function (module) {
      setToPairs = module.default;
    }],
    execute: function () {

      /** `Object#toString` result references. */
      var mapTag = '[object Map]',
          setTag = '[object Set]';

      /**
       * Creates a `_.toPairs` or `_.toPairsIn` function.
       *
       * @private
       * @param {Function} keysFunc The function to get the keys of a given object.
       * @returns {Function} Returns the new pairs function.
       */
      function createToPairs(keysFunc) {
        return function(object) {
          var tag = getTag(object);
          if (tag == mapTag) {
            return mapToArray(object);
          }
          if (tag == setTag) {
            return setToPairs(object);
          }
          return baseToPairs(object, keysFunc(object));
        };
      }
      exports('default', createToPairs);

    }
  };
});
