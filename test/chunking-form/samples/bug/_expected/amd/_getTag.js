define(['./_DataView.js', './_Map.js', './_Promise.js', './_Set.js', './_WeakMap.js', './_baseGetTag.js', './_toSource.js'], function (___DataView_js, ___Map_js, ___Promise_js, ___Set_js, ___WeakMap_js, ___baseGetTag_js, ___toSource_js) { 'use strict';

  /** `Object#toString` result references. */
  var mapTag = '[object Map]',
      objectTag = '[object Object]',
      promiseTag = '[object Promise]',
      setTag = '[object Set]',
      weakMapTag = '[object WeakMap]';

  var dataViewTag = '[object DataView]';

  /** Used to detect maps, sets, and weakmaps. */
  var dataViewCtorString = ___toSource_js.default(___DataView_js.default),
      mapCtorString = ___toSource_js.default(___Map_js.default),
      promiseCtorString = ___toSource_js.default(___Promise_js.default),
      setCtorString = ___toSource_js.default(___Set_js.default),
      weakMapCtorString = ___toSource_js.default(___WeakMap_js.default);

  /**
   * Gets the `toStringTag` of `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  var getTag = ___baseGetTag_js.default;

  // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
  if ((___DataView_js.default && getTag(new ___DataView_js.default(new ArrayBuffer(1))) != dataViewTag) ||
      (___Map_js.default && getTag(new ___Map_js.default) != mapTag) ||
      (___Promise_js.default && getTag(___Promise_js.default.resolve()) != promiseTag) ||
      (___Set_js.default && getTag(new ___Set_js.default) != setTag) ||
      (___WeakMap_js.default && getTag(new ___WeakMap_js.default) != weakMapTag)) {
    getTag = function(value) {
      var result = ___baseGetTag_js.default(value),
          Ctor = result == objectTag ? value.constructor : undefined,
          ctorString = Ctor ? ___toSource_js.default(Ctor) : '';

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

  var getTag$1 = getTag;

  return getTag$1;

});
