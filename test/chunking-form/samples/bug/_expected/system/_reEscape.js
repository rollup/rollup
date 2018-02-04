System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			/** Used to match template delimiters. */
			var reEscape = /<%-([\s\S]+?)%>/g;
			exports('default', reEscape);

		}
	};
});
