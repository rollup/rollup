System.register(['./_virtual/_commonjsHelpers.js', './under-build2.js'], (function (exports) {
	'use strict';
	var getDefaultExportFromCjs, requireUnderBuild;
	return {
		setters: [function (module) {
			getDefaultExportFromCjs = module.getDefaultExportFromCjs;
		}, function (module) {
			requireUnderBuild = module.__require;
		}],
		execute: (function () {

			var underBuildExports = requireUnderBuild();
			var underBuild = exports("default", /*@__PURE__*/getDefaultExportFromCjs(underBuildExports));

		})
	};
}));
