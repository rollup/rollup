System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			/** Used to match template delimiters. */
			var reInterpolate = /<%=([\s\S]+?)%>/g;
			exports('default', reInterpolate);

		}
	};
});
