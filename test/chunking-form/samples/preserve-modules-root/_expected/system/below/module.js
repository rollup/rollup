System.register(['../_virtual/_commonjsHelpers.js', './module2.js'], (function (exports) {
	'use strict';
	var getDefaultExportFromCjs, requireModule;
	return {
		setters: [function (module) {
			getDefaultExportFromCjs = module.getDefaultExportFromCjs;
		}, function (module) {
			requireModule = module.__require;
		}],
		execute: (function () {

			var moduleExports = requireModule();
			var module$1 = exports("default", /*@__PURE__*/getDefaultExportFromCjs(moduleExports));

		})
	};
}));
