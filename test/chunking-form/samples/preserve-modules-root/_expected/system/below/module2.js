System.register(['../_virtual/_commonjsHelpers.js', '../custom_modules/@my-scope/my-base-pkg/index.js', '../_virtual/index.js'], (function (exports) {
  'use strict';
  var getDefaultExportFromCjs, myBasePkg;
  return {
    setters: [function (module) {
      getDefaultExportFromCjs = module.getDefaultExportFromCjs;
    }, null, function (module) {
      myBasePkg = module.__exports;
    }],
    execute: (function () {

      const base2 = myBasePkg;

      var module$1 = {
        base2,
      };

      var module$2 = exports("default", /*@__PURE__*/getDefaultExportFromCjs(module$1));

    })
  };
}));
