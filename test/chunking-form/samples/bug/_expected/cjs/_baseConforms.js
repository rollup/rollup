'use strict';

var ___baseConformsTo_js = require('./_baseConformsTo.js');
var __keys_js = require('./keys.js');

/**
 * The base implementation of `_.conforms` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property predicates to conform to.
 * @returns {Function} Returns the new spec function.
 */
function baseConforms(source) {
  var props = __keys_js.default(source);
  return function(object) {
    return ___baseConformsTo_js.default(object, source, props);
  };
}

module.exports = baseConforms;
