define(['exports'], function (exports) { 'use strict';

	var _missingExportShim = void 0;

	console.log('This is the output when a missing export is used internally but not reexported');

	function almostUseUnused(useIt) {
		if (useIt) {
			console.log(__chunk_1.missing1);
		}
	}

	almostUseUnused(false);

	exports.missing1 = __chunk_1.missing1;

});
