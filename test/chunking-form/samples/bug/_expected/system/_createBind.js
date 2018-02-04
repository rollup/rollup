System.register(['./_createCtor.js', './_root.js'], function (exports, module) {
  'use strict';
  var createCtor, root;
  return {
    setters: [function (module) {
      createCtor = module.default;
    }, function (module) {
      root = module.default;
    }],
    execute: function () {

      /** Used to compose bitmasks for function metadata. */
      var WRAP_BIND_FLAG = 1;

      /**
       * Creates a function that wraps `func` to invoke it with the optional `this`
       * binding of `thisArg`.
       *
       * @private
       * @param {Function} func The function to wrap.
       * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
       * @param {*} [thisArg] The `this` binding of `func`.
       * @returns {Function} Returns the new wrapped function.
       */
      function createBind(func, bitmask, thisArg) {
        var isBind = bitmask & WRAP_BIND_FLAG,
            Ctor = createCtor(func);

        function wrapper() {
          var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
          return fn.apply(isBind ? thisArg : this, arguments);
        }
        return wrapper;
      }
      exports('default', createBind);

    }
  };
});
