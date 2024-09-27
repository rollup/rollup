System.register(['../custom_modules/@my-scope/my-base-pkg/index.js'], (function (exports) {
  'use strict';
  var requireMyBasePkg;
  return {
    setters: [function (module) {
      requireMyBasePkg = module.__require;
    }],
    execute: (function () {

      exports("__require", requireModule);

      var module$1;
      var hasRequiredModule;

      function requireModule () {
      	if (hasRequiredModule) return module$1;
      	hasRequiredModule = 1;
      	const base2 = requireMyBasePkg();

      	module$1 = {
      	  base2,
      	};
      	return module$1;
      }

    })
  };
}));
