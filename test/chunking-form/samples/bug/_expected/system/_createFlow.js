System.register(['./_LodashWrapper.js', './_flatRest.js', './_getData.js', './_getFuncName.js', './isArray.js', './_isLaziable.js'], function (exports, module) {
  'use strict';
  var LodashWrapper, flatRest, getData, getFuncName, isArray, isLaziable;
  return {
    setters: [function (module) {
      LodashWrapper = module.default;
    }, function (module) {
      flatRest = module.default;
    }, function (module) {
      getData = module.default;
    }, function (module) {
      getFuncName = module.default;
    }, function (module) {
      isArray = module.default;
    }, function (module) {
      isLaziable = module.default;
    }],
    execute: function () {

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
        return flatRest(function(funcs) {
          var length = funcs.length,
              index = length,
              prereq = LodashWrapper.prototype.thru;

          if (fromRight) {
            funcs.reverse();
          }
          while (index--) {
            var func = funcs[index];
            if (typeof func != 'function') {
              throw new TypeError(FUNC_ERROR_TEXT);
            }
            if (prereq && !wrapper && getFuncName(func) == 'wrapper') {
              var wrapper = new LodashWrapper([], true);
            }
          }
          index = wrapper ? index : length;
          while (++index < length) {
            func = funcs[index];

            var funcName = getFuncName(func),
                data = funcName == 'wrapper' ? getData(func) : undefined;

            if (data && isLaziable(data[0]) &&
                  data[1] == (WRAP_ARY_FLAG | WRAP_CURRY_FLAG | WRAP_PARTIAL_FLAG | WRAP_REARG_FLAG) &&
                  !data[4].length && data[9] == 1
                ) {
              wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]);
            } else {
              wrapper = (func.length == 1 && isLaziable(func))
                ? wrapper[funcName]()
                : wrapper.thru(func);
            }
          }
          return function() {
            var args = arguments,
                value = args[0];

            if (wrapper && args.length == 1 && isArray(value)) {
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
      exports('default', createFlow);

    }
  };
});
