System.register(['./dep1.js', './dep2.js'], function (exports, module) {
	'use strict';
	var _missingExportShim$1, _missingExportShim$2, _missingExportShim$3;
	return {
		setters: [function (module) {
			_missingExportShim$1 = module.missing1;
		}, function (module) {
			_missingExportShim$2 = module.missing2;
			_missingExportShim$3 = module.previousShimmedExport;
		}],
		execute: function () {

			console.log(_missingExportShim$1, _missingExportShim$2, _missingExportShim$3);

		}
	};
});
