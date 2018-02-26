'use strict';

var ___LazyWrapper_js = require('./_LazyWrapper.js');
var ___getData_js = require('./_getData.js');
var ___getFuncName_js = require('./_getFuncName.js');
var __wrapperLodash_js = require('./wrapperLodash.js');

/**
 * Checks if `func` has a lazy counterpart.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` has a lazy counterpart,
 *  else `false`.
 */
function isLaziable(func) {
  var funcName = ___getFuncName_js.default(func),
      other = __wrapperLodash_js.default[funcName];

  if (typeof other != 'function' || !(funcName in ___LazyWrapper_js.default.prototype)) {
    return false;
  }
  if (func === other) {
    return true;
  }
  var data = ___getData_js.default(other);
  return !!data && func === data[0];
}

module.exports = isLaziable;
