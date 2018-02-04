System.register(['./_LazyWrapper.js', './_getData.js', './_getFuncName.js', './wrapperLodash.js'], function (exports, module) {
  'use strict';
  var LazyWrapper, getData, getFuncName, lodash;
  return {
    setters: [function (module) {
      LazyWrapper = module.default;
    }, function (module) {
      getData = module.default;
    }, function (module) {
      getFuncName = module.default;
    }, function (module) {
      lodash = module.default;
    }],
    execute: function () {

      /**
       * Checks if `func` has a lazy counterpart.
       *
       * @private
       * @param {Function} func The function to check.
       * @returns {boolean} Returns `true` if `func` has a lazy counterpart,
       *  else `false`.
       */
      function isLaziable(func) {
        var funcName = getFuncName(func),
            other = lodash[funcName];

        if (typeof other != 'function' || !(funcName in LazyWrapper.prototype)) {
          return false;
        }
        if (func === other) {
          return true;
        }
        var data = getData(other);
        return !!data && func === data[0];
      }
      exports('default', isLaziable);

    }
  };
});
