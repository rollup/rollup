define(['./eq.js', './isArrayLike.js', './_isIndex.js', './isObject.js'], function (__eq_js, __isArrayLike_js, ___isIndex_js, __isObject_js) { 'use strict';

  /**
   * Checks if the given arguments are from an iteratee call.
   *
   * @private
   * @param {*} value The potential iteratee value argument.
   * @param {*} index The potential iteratee index or key argument.
   * @param {*} object The potential iteratee object argument.
   * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
   *  else `false`.
   */
  function isIterateeCall(value, index, object) {
    if (!__isObject_js.default(object)) {
      return false;
    }
    var type = typeof index;
    if (type == 'number'
          ? (__isArrayLike_js.default(object) && ___isIndex_js.default(index, object.length))
          : (type == 'string' && index in object)
        ) {
      return __eq_js.default(object[index], value);
    }
    return false;
  }

  return isIterateeCall;

});
