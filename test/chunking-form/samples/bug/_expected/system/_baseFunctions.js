System.register(['./_arrayFilter.js', './isFunction.js'], function (exports, module) {
  'use strict';
  var arrayFilter, isFunction;
  return {
    setters: [function (module) {
      arrayFilter = module.default;
    }, function (module) {
      isFunction = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `_.functions` which creates an array of
       * `object` function property names filtered from `props`.
       *
       * @private
       * @param {Object} object The object to inspect.
       * @param {Array} props The property names to filter.
       * @returns {Array} Returns the function names.
       */
      function baseFunctions(object, props) {
        return arrayFilter(props, function(key) {
          return isFunction(object[key]);
        });
      }
      exports('default', baseFunctions);

    }
  };
});
