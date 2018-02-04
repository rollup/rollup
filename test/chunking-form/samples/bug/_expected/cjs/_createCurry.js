'use strict';

var ___apply_js = require('./_apply.js');
var ___createCtor_js = require('./_createCtor.js');
var ___createHybrid_js = require('./_createHybrid.js');
var ___createRecurry_js = require('./_createRecurry.js');
var ___getHolder_js = require('./_getHolder.js');
var ___replaceHolders_js = require('./_replaceHolders.js');
var ___root_js = require('./_root.js');

/**
 * Creates a function that wraps `func` to enable currying.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
 * @param {number} arity The arity of `func`.
 * @returns {Function} Returns the new wrapped function.
 */
function createCurry(func, bitmask, arity) {
  var Ctor = ___createCtor_js.default(func);

  function wrapper() {
    var length = arguments.length,
        args = Array(length),
        index = length,
        placeholder = ___getHolder_js.default(wrapper);

    while (index--) {
      args[index] = arguments[index];
    }
    var holders = (length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder)
      ? []
      : ___replaceHolders_js.default(args, placeholder);

    length -= holders.length;
    if (length < arity) {
      return ___createRecurry_js.default(
        func, bitmask, ___createHybrid_js.default, wrapper.placeholder, undefined,
        args, holders, undefined, undefined, arity - length);
    }
    var fn = (this && this !== ___root_js.default && this instanceof wrapper) ? Ctor : func;
    return ___apply_js.default(fn, this, args);
  }
  return wrapper;
}

module.exports = createCurry;
