System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			/** Used to match template delimiters. */
			var reEvaluate = /<%([\s\S]+?)%>/g;
			exports('default', reEvaluate);

		}
	};
});
