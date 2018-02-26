define(['./_composeArgs.js', './_composeArgsRight.js', './_countHolders.js', './_createCtor.js', './_createRecurry.js', './_getHolder.js', './_reorder.js', './_replaceHolders.js', './_root.js'], function (___composeArgs_js, ___composeArgsRight_js, ___countHolders_js, ___createCtor_js, ___createRecurry_js, ___getHolder_js, ___reorder_js, ___replaceHolders_js, ___root_js) { 'use strict';

  /** Used to compose bitmasks for function metadata. */
  var WRAP_BIND_FLAG = 1,
      WRAP_BIND_KEY_FLAG = 2,
      WRAP_CURRY_FLAG = 8,
      WRAP_CURRY_RIGHT_FLAG = 16,
      WRAP_ARY_FLAG = 128,
      WRAP_FLIP_FLAG = 512;

  /**
   * Creates a function that wraps `func` to invoke it with optional `this`
   * binding of `thisArg`, partial application, and currying.
   *
   * @private
   * @param {Function|string} func The function or method name to wrap.
   * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param {Array} [partials] The arguments to prepend to those provided to
   *  the new function.
   * @param {Array} [holders] The `partials` placeholder indexes.
   * @param {Array} [partialsRight] The arguments to append to those provided
   *  to the new function.
   * @param {Array} [holdersRight] The `partialsRight` placeholder indexes.
   * @param {Array} [argPos] The argument positions of the new function.
   * @param {number} [ary] The arity cap of `func`.
   * @param {number} [arity] The arity of `func`.
   * @returns {Function} Returns the new wrapped function.
   */
  function createHybrid(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
    var isAry = bitmask & WRAP_ARY_FLAG,
        isBind = bitmask & WRAP_BIND_FLAG,
        isBindKey = bitmask & WRAP_BIND_KEY_FLAG,
        isCurried = bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG),
        isFlip = bitmask & WRAP_FLIP_FLAG,
        Ctor = isBindKey ? undefined : ___createCtor_js.default(func);

    function wrapper() {
      var length = arguments.length,
          args = Array(length),
          index = length;

      while (index--) {
        args[index] = arguments[index];
      }
      if (isCurried) {
        var placeholder = ___getHolder_js.default(wrapper),
            holdersCount = ___countHolders_js.default(args, placeholder);
      }
      if (partials) {
        args = ___composeArgs_js.default(args, partials, holders, isCurried);
      }
      if (partialsRight) {
        args = ___composeArgsRight_js.default(args, partialsRight, holdersRight, isCurried);
      }
      length -= holdersCount;
      if (isCurried && length < arity) {
        var newHolders = ___replaceHolders_js.default(args, placeholder);
        return ___createRecurry_js.default(
          func, bitmask, createHybrid, wrapper.placeholder, thisArg,
          args, newHolders, argPos, ary, arity - length
        );
      }
      var thisBinding = isBind ? thisArg : this,
          fn = isBindKey ? thisBinding[func] : func;

      length = args.length;
      if (argPos) {
        args = ___reorder_js.default(args, argPos);
      } else if (isFlip && length > 1) {
        args.reverse();
      }
      if (isAry && ary < length) {
        args.length = ary;
      }
      if (this && this !== ___root_js.default && this instanceof wrapper) {
        fn = Ctor || ___createCtor_js.default(fn);
      }
      return fn.apply(thisBinding, args);
    }
    return wrapper;
  }

  return createHybrid;

});
