define(['exports'], function (exports) { 'use strict';

  var _missingExportShim = void 0;

  function x () {
    sideEffect();
  }

  exports.x = x;
  exports.missingFn = dep.missingFn;
  exports.missingExport = dep.missingFn;
  exports.default = dep.missingFn;

  Object.defineProperty(exports, '__esModule', { value: true });

});
