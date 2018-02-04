System.register(['./_apply.js', './_createCtor.js', './_createHybrid.js', './_createRecurry.js', './_getHolder.js', './_replaceHolders.js', './_root.js'], function (exports, module) {
  'use strict';
  var apply, createCtor, createHybrid, createRecurry, getHolder, replaceHolders, root;
  return {
    setters: [function (module) {
      apply = module.default;
    }, function (module) {
      createCtor = module.default;
    }, function (module) {
      createHybrid = module.default;
    }, function (module) {
      createRecurry = module.default;
    }, function (module) {
      getHolder = module.default;
    }, function (module) {
      replaceHolders = module.default;
    }, function (module) {
      root = module.default;
    }],
    execute: function () {

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
        var Ctor = createCtor(func);

        function wrapper() {
          var length = arguments.length,
              args = Array(length),
              index = length,
              placeholder = getHolder(wrapper);

          while (index--) {
            args[index] = arguments[index];
          }
          var holders = (length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder)
            ? []
            : replaceHolders(args, placeholder);

          length -= holders.length;
          if (length < arity) {
            return createRecurry(
              func, bitmask, createHybrid, wrapper.placeholder, undefined,
              args, holders, undefined, undefined, arity - length);
          }
          var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
          return apply(fn, this, args);
        }
        return wrapper;
      }
      exports('default', createCurry);

    }
  };
});
