define(['./_baseToPairs.js', './_getTag.js', './_mapToArray.js', './_setToPairs.js'], function (___baseToPairs_js, ___getTag_js, ___mapToArray_js, ___setToPairs_js) { 'use strict';

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
      var tag = ___getTag_js.default(object);
      if (tag == mapTag) {
        return ___mapToArray_js.default(object);
      }
      if (tag == setTag) {
        return ___setToPairs_js.default(object);
      }
      return ___baseToPairs_js.default(object, keysFunc(object));
    };
  }

  return createToPairs;

});
