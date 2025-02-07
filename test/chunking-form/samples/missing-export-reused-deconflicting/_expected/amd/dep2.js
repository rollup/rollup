define(['exports'], (function (exports) { 'use strict';

	var _missingExportShim = void 0;

	console.log('This is the output when a missing export is reexported');

	var _missingExportShim$1 = void 0;

	console.log(_missingExportShim$1);

	exports.missing2 = _missingExportShim;
	exports.previousShimmedExport = _missingExportShim$1;

}));
