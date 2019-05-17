define(['exports'], function (exports) { 'use strict';

  var _missingExportShim = void 0;

  function x () {
    sideEffect();
  }

  exports.default = _missingExportShim;
  exports.missingExport = _missingExportShim;
  exports.missingFn = _missingExportShim;
  exports.x = x;

  Object.defineProperty(exports, '__esModule', { value: true });

});
