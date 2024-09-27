System.register(['./_commonjsHelpers.js', '../commonjs.js'], (function (exports) {
	'use strict';
	var getDefaultExportFromCjs, requireCommonjs;
	return {
		setters: [function (module) {
			getDefaultExportFromCjs = module.getDefaultExportFromCjs;
		}, function (module) {
			requireCommonjs = module.__require;
		}],
		execute: (function () {

			var commonjsExports = requireCommonjs();
			var value = exports("default", /*@__PURE__*/getDefaultExportFromCjs(commonjsExports));

		})
	};
}));
