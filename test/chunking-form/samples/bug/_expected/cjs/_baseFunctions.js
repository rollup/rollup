'use strict';

var ___arrayFilter_js = require('./_arrayFilter.js');
var __isFunction_js = require('./isFunction.js');

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

module.exports = baseFunctions;
