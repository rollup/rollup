System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      exports('x', x);

      var _missingExportShim = void 0;

      function x () {
        sideEffect();
      }

      exports({
        default: _missingExportShim,
        missingExport: _missingExportShim,
        missingFn: _missingExportShim
      });

    }
  };
});
