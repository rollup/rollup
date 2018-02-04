define(['./isObject.js'], function (__isObject_js) { 'use strict';

  /**
   * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` if suitable for strict
   *  equality comparisons, else `false`.
   */
  function isStrictComparable(value) {
    return value === value && !__isObject_js.default(value);
  }

  return isStrictComparable;

});
