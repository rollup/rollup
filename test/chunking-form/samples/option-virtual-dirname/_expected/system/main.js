System.register(['./rollup_virtual/_commonjsHelpers.js', './main2.js'], (function (exports) {
	'use strict';
	var getDefaultExportFromCjs, requireMain;
	return {
		setters: [function (module) {
			getDefaultExportFromCjs = module.getDefaultExportFromCjs;
		}, function (module) {
			requireMain = module.__require;
		}],
		execute: (function () {

			var mainExports = requireMain();
			var main = exports("default", /*@__PURE__*/getDefaultExportFromCjs(mainExports));

		})
	};
}));
