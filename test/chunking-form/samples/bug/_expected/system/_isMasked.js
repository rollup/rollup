System.register(['./_coreJsData.js'], function (exports, module) {
  'use strict';
  var coreJsData;
  return {
    setters: [function (module) {
      coreJsData = module.default;
    }],
    execute: function () {

      /** Used to detect methods masquerading as native. */
      var maskSrcKey = (function() {
        var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
        return uid ? ('Symbol(src)_1.' + uid) : '';
      }());

      /**
       * Checks if `func` has its source masked.
       *
       * @private
       * @param {Function} func The function to check.
       * @returns {boolean} Returns `true` if `func` is masked, else `false`.
       */
      function isMasked(func) {
        return !!maskSrcKey && (maskSrcKey in func);
      }
      exports('default', isMasked);

    }
  };
});
