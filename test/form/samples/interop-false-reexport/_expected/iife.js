var foo = (function (exports, external) {
	'use strict';



	Object.defineProperty(exports, 'p', {
		enumerable: true,
		get: function () {
			return external['default'];
		}
	});
	Object.defineProperty(exports, 'q', {
		enumerable: true,
		get: function () {
			return external.p;
		}
	});

	return exports;

}({}, external));
