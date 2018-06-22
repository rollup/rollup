System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      exports({
        x: x,
        missingFn: dep.missingFn,
        missingExport: dep.missingFn,
        default: dep.missingFn
      });

      var _missingExportShim = void 0;

      function x () {
        sideEffect();
      }

    }
  };
});
