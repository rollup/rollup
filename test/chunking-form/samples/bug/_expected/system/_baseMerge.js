System.register(['./_Stack.js', './_assignMergeValue.js', './_baseFor.js', './_baseMergeDeep.js', './isObject.js', './keysIn.js', './_safeGet.js'], function (exports, module) {
  'use strict';
  var Stack, assignMergeValue, baseFor, baseMergeDeep, isObject, keysIn$1, safeGet;
  return {
    setters: [function (module) {
      Stack = module.default;
    }, function (module) {
      assignMergeValue = module.default;
    }, function (module) {
      baseFor = module.default;
    }, function (module) {
      baseMergeDeep = module.default;
    }, function (module) {
      isObject = module.default;
    }, function (module) {
      keysIn$1 = module.default;
    }, function (module) {
      safeGet = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `_.merge` without support for multiple sources.
       *
       * @private
       * @param {Object} object The destination object.
       * @param {Object} source The source object.
       * @param {number} srcIndex The index of `source`.
       * @param {Function} [customizer] The function to customize merged values.
       * @param {Object} [stack] Tracks traversed source values and their merged
       *  counterparts.
       */
      function baseMerge(object, source, srcIndex, customizer, stack) {
        if (object === source) {
          return;
        }
        baseFor(source, function(srcValue, key) {
          if (isObject(srcValue)) {
            stack || (stack = new Stack);
            baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
          }
          else {
            var newValue = customizer
              ? customizer(safeGet(object, key), srcValue, (key + ''), object, source, stack)
              : undefined;

            if (newValue === undefined) {
              newValue = srcValue;
            }
            assignMergeValue(object, key, newValue);
          }
        }, keysIn$1);
      }
      exports('default', baseMerge);

    }
  };
});
