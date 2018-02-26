'use strict';

var ___metaMap_js = require('./_metaMap.js');
var __noop_js = require('./noop.js');

/**
 * Gets metadata for `func`.
 *
 * @private
 * @param {Function} func The function to query.
 * @returns {*} Returns the metadata for `func`.
 */
var getData = !___metaMap_js.default ? __noop_js.default : function(func) {
  return ___metaMap_js.default.get(func);
};

module.exports = getData;
