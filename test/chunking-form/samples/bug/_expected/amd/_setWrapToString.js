define(['./_getWrapDetails.js', './_insertWrapDetails.js', './_setToString.js', './_updateWrapDetails.js'], function (___getWrapDetails_js, ___insertWrapDetails_js, ___setToString_js, ___updateWrapDetails_js) { 'use strict';

  /**
   * Sets the `toString` method of `wrapper` to mimic the source of `reference`
   * with wrapper details in a comment at the top of the source body.
   *
   * @private
   * @param {Function} wrapper The function to modify.
   * @param {Function} reference The reference function.
   * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
   * @returns {Function} Returns `wrapper`.
   */
  function setWrapToString(wrapper, reference, bitmask) {
    var source = (reference + '');
    return ___setToString_js.default(wrapper, ___insertWrapDetails_js.default(source, ___updateWrapDetails_js.default(___getWrapDetails_js.default(source), bitmask)));
  }

  return setWrapToString;

});
