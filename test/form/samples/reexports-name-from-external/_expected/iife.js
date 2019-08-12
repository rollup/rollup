var myBundle = (function (exports, external) {
	'use strict';



	Object.defineProperty(exports, 'foo', {
		enumerable: true,
		get: function () {
			return external.foo;
		}
	});

	return exports;

}({}, external));
