System.register(['./_DataView.js', './_Map.js', './_Promise.js', './_Set.js', './_WeakMap.js', './_baseGetTag.js', './_toSource.js'], function (exports, module) {
  'use strict';
  var DataView, Map, Promise, Set, WeakMap, baseGetTag, toSource;
  return {
    setters: [function (module) {
      DataView = module.default;
    }, function (module) {
      Map = module.default;
    }, function (module) {
      Promise = module.default;
    }, function (module) {
      Set = module.default;
    }, function (module) {
      WeakMap = module.default;
    }, function (module) {
      baseGetTag = module.default;
    }, function (module) {
      toSource = module.default;
    }],
    execute: function () {

      /** `Object#toString` result references. */
      var mapTag = '[object Map]',
          objectTag = '[object Object]',
          promiseTag = '[object Promise]',
          setTag = '[object Set]',
          weakMapTag = '[object WeakMap]';

      var dataViewTag = '[object DataView]';

      /** Used to detect maps, sets, and weakmaps. */
      var dataViewCtorString = toSource(DataView),
          mapCtorString = toSource(Map),
          promiseCtorString = toSource(Promise),
          setCtorString = toSource(Set),
          weakMapCtorString = toSource(WeakMap);

      /**
       * Gets the `toStringTag` of `value`.
       *
       * @private
       * @param {*} value The value to query.
       * @returns {string} Returns the `toStringTag`.
       */
      var getTag = baseGetTag;

      // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
      if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
          (Map && getTag(new Map) != mapTag) ||
          (Promise && getTag(Promise.resolve()) != promiseTag) ||
          (Set && getTag(new Set) != setTag) ||
          (WeakMap && getTag(new WeakMap) != weakMapTag)) {
        getTag = function(value) {
          var result = baseGetTag(value),
              Ctor = result == objectTag ? value.constructor : undefined,
              ctorString = Ctor ? toSource(Ctor) : '';

          if (ctorString) {
            switch (ctorString) {
              case dataViewCtorString: return dataViewTag;
              case mapCtorString: return mapTag;
              case promiseCtorString: return promiseTag;
              case setCtorString: return setTag;
              case weakMapCtorString: return weakMapTag;
            }
          }
          return result;
        };
      }

      var getTag$1 = exports('default', getTag);

    }
  };
});
