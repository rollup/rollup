var foo = (function (exports, external) {
	'use strict';



	exports.p = external.default;
	Object.defineProperty(exports, 'q', {
		enumerable: true,
		get: function () {
			return external.p;
		}
	});

	return exports;

}({}, external));
