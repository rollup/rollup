var myBundle = (function (exports, external) {
	'use strict';



	Object.keys(external).forEach(function (key) {
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function () {
				return external[key];
			}
		});
	});

	return exports;

}({}, external));
