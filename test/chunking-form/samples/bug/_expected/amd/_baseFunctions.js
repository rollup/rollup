define(['./_arrayFilter.js', './isFunction.js'], function (___arrayFilter_js, __isFunction_js) { 'use strict';

  /**
   * The base implementation of `_.functions` which creates an array of
   * `object` function property names filtered from `props`.
   *
   * @private
   * @param {Object} object The object to inspect.
   * @param {Array} props The property names to filter.
   * @returns {Array} Returns the function names.
   */
  function baseFunctions(object, props) {
    return ___arrayFilter_js.default(props, function(key) {
      return __isFunction_js.default(object[key]);
    });
  }

  return baseFunctions;

});
