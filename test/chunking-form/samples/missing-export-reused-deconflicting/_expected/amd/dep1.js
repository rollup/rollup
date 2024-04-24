define(['exports'], (function (exports) { 'use strict';

	var _missingExportShim = void 0;

	console.log('This is the output when a missing export is used internally but not reexported');

	function almostUseUnused(useIt) {
		{
			console.log(useIt);
			console.log(_missingExportShim);
		}
	}

	almostUseUnused(true);

	exports.missing1 = _missingExportShim;

}));
