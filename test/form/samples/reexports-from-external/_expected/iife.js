var myBundle = (function (exports, external) {
	'use strict';



	Object.keys(external).forEach(function (k) {
		if (k !== 'default') Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () {
				return external[k];
			}
		});
	});

	return exports;

}({}, external));
