System.register(['./_baseGetTag.js', './isObjectLike.js'], function (exports, module) {
  'use strict';
  var baseGetTag, isObjectLike;
  return {
    setters: [function (module) {
      baseGetTag = module.default;
    }, function (module) {
      isObjectLike = module.default;
    }],
    execute: function () {

      var arrayBufferTag = '[object ArrayBuffer]';

      /**
       * The base implementation of `_.isArrayBuffer` without Node.js optimizations.
       *
       * @private
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is an array buffer, else `false`.
       */
      function baseIsArrayBuffer(value) {
        return isObjectLike(value) && baseGetTag(value) == arrayBufferTag;
      }
      exports('default', baseIsArrayBuffer);

    }
  };
});
