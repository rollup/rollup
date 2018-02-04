System.register(['./_assignMergeValue.js', './_cloneBuffer.js', './_cloneTypedArray.js', './_copyArray.js', './_initCloneObject.js', './isArguments.js', './isArray.js', './isArrayLikeObject.js', './isBuffer.js', './isFunction.js', './isObject.js', './isPlainObject.js', './isTypedArray.js', './_safeGet.js', './toPlainObject.js'], function (exports, module) {
  'use strict';
  var assignMergeValue, cloneBuffer, cloneTypedArray, copyArray, initCloneObject, isArguments, isArray, isArrayLikeObject, isBuffer, isFunction, isObject, isPlainObject, isTypedArray, safeGet, toPlainObject;
  return {
    setters: [function (module) {
      assignMergeValue = module.default;
    }, function (module) {
      cloneBuffer = module.default;
    }, function (module) {
      cloneTypedArray = module.default;
    }, function (module) {
      copyArray = module.default;
    }, function (module) {
      initCloneObject = module.default;
    }, function (module) {
      isArguments = module.default;
    }, function (module) {
      isArray = module.default;
    }, function (module) {
      isArrayLikeObject = module.default;
    }, function (module) {
      isBuffer = module.default;
    }, function (module) {
      isFunction = module.default;
    }, function (module) {
      isObject = module.default;
    }, function (module) {
      isPlainObject = module.default;
    }, function (module) {
      isTypedArray = module.default;
    }, function (module) {
      safeGet = module.default;
    }, function (module) {
      toPlainObject = module.default;
    }],
    execute: function () {

      /**
       * A specialized version of `baseMerge` for arrays and objects which performs
       * deep merges and tracks traversed objects enabling objects with circular
       * references to be merged.
       *
       * @private
       * @param {Object} object The destination object.
       * @param {Object} source The source object.
       * @param {string} key The key of the value to merge.
       * @param {number} srcIndex The index of `source`.
       * @param {Function} mergeFunc The function to merge values.
       * @param {Function} [customizer] The function to customize assigned values.
       * @param {Object} [stack] Tracks traversed source values and their merged
       *  counterparts.
       */
      function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
        var objValue = safeGet(object, key),
            srcValue = safeGet(source, key),
            stacked = stack.get(srcValue);

        if (stacked) {
          assignMergeValue(object, key, stacked);
          return;
        }
        var newValue = customizer
          ? customizer(objValue, srcValue, (key + ''), object, source, stack)
          : undefined;

        var isCommon = newValue === undefined;

        if (isCommon) {
          var isArr = isArray(srcValue),
              isBuff = !isArr && isBuffer(srcValue),
              isTyped = !isArr && !isBuff && isTypedArray(srcValue);

          newValue = srcValue;
          if (isArr || isBuff || isTyped) {
            if (isArray(objValue)) {
              newValue = objValue;
            }
            else if (isArrayLikeObject(objValue)) {
              newValue = copyArray(objValue);
            }
            else if (isBuff) {
              isCommon = false;
              newValue = cloneBuffer(srcValue, true);
            }
            else if (isTyped) {
              isCommon = false;
              newValue = cloneTypedArray(srcValue, true);
            }
            else {
              newValue = [];
            }
          }
          else if (isPlainObject(srcValue) || isArguments(srcValue)) {
            newValue = objValue;
            if (isArguments(objValue)) {
              newValue = toPlainObject(objValue);
            }
            else if (!isObject(objValue) || (srcIndex && isFunction(objValue))) {
              newValue = initCloneObject(srcValue);
            }
          }
          else {
            isCommon = false;
          }
        }
        if (isCommon) {
          // Recursively merge objects and arrays (susceptible to call stack limits).
          stack.set(srcValue, newValue);
          mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
          stack['delete'](srcValue);
        }
        assignMergeValue(object, key, newValue);
      }
      exports('default', baseMergeDeep);

    }
  };
});
