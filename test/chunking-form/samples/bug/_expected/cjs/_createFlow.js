'use strict';

var ___LodashWrapper_js = require('./_LodashWrapper.js');
var ___flatRest_js = require('./_flatRest.js');
var ___getData_js = require('./_getData.js');
var ___getFuncName_js = require('./_getFuncName.js');
var __isArray_js = require('./isArray.js');
var ___isLaziable_js = require('./_isLaziable.js');

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used to compose bitmasks for function metadata. */
var WRAP_CURRY_FLAG = 8,
    WRAP_PARTIAL_FLAG = 32,
    WRAP_ARY_FLAG = 128,
    WRAP_REARG_FLAG = 256;

/**
 * Creates a `_.flow` or `_.flowRight` function.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new flow function.
 */
function createFlow(fromRight) {
  return ___flatRest_js.default(function(funcs) {
    var length = funcs.length,
        index = length,
        prereq = ___LodashWrapper_js.default.prototype.thru;

    if (fromRight) {
      funcs.reverse();
    }
    while (index--) {
      var func = funcs[index];
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      if (prereq && !wrapper && ___getFuncName_js.default(func) == 'wrapper') {
        var wrapper = new ___LodashWrapper_js.default([], true);
      }
    }
    index = wrapper ? index : length;
    while (++index < length) {
      func = funcs[index];

      var funcName = ___getFuncName_js.default(func),
          data = funcName == 'wrapper' ? ___getData_js.default(func) : undefined;

      if (data && ___isLaziable_js.default(data[0]) &&
            data[1] == (WRAP_ARY_FLAG | WRAP_CURRY_FLAG | WRAP_PARTIAL_FLAG | WRAP_REARG_FLAG) &&
            !data[4].length && data[9] == 1
          ) {
        wrapper = wrapper[___getFuncName_js.default(data[0])].apply(wrapper, data[3]);
      } else {
        wrapper = (func.length == 1 && ___isLaziable_js.default(func))
          ? wrapper[funcName]()
          : wrapper.thru(func);
      }
    }
    return function() {
      var args = arguments,
          value = args[0];

      if (wrapper && args.length == 1 && __isArray_js.default(value)) {
        return wrapper.plant(value).value();
      }
      var index = 0,
          result = length ? funcs[index].apply(this, args) : value;

      while (++index < length) {
        result = funcs[index].call(this, result);
      }
      return result;
    };
  });
}

module.exports = createFlow;
