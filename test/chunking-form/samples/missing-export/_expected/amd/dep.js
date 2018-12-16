define(['exports'], function (exports) { 'use strict';

  var _missingExportShim = void 0;

  function x () {
    sideEffect();
  }

  exports.x = x;
  exports.missingFn = _missingExportShim;
  exports.missingExport = _missingExportShim;
  exports.default = _missingExportShim;

  Object.defineProperty(exports, '__esModule', { value: true });

});
