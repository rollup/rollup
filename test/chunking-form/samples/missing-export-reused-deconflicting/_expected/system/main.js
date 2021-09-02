System.register(['./dep1.js', './dep2.js'], (function () {
	'use strict';
	var _missingExportShim, _missingExportShim$1, _missingExportShim$2;
	return {
		setters: [function (module) {
			_missingExportShim = module.missing1;
		}, function (module) {
			_missingExportShim$1 = module.missing2;
			_missingExportShim$2 = module.previousShimmedExport;
		}],
		execute: (function () {

			console.log(_missingExportShim, _missingExportShim$1, _missingExportShim$2);

		})
	};
}));
