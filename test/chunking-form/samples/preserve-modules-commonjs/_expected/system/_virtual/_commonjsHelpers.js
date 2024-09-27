System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			exports("getDefaultExportFromCjs", getDefaultExportFromCjs);

			function getDefaultExportFromCjs (x) {
				return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
			}

		})
	};
}));
