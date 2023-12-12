System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var _missingExportShim = void 0;

			console.log('This is the output when a missing export is reexported');

			var _missingExportShim$1 = exports("previousShimmedExport", void 0);

			console.log(_missingExportShim$1);

			exports('missing2', _missingExportShim);

		})
	};
}));
