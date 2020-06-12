var Q = (function (exports, quoted_external) {
	'use strict';



	Object.keys(quoted_external).forEach(function (k) {
		if (k !== 'default') Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () {
				return quoted_external[k];
			}
		});
	});

	return exports;

}({}, quotedExternal));
