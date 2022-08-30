var exposedInternals = (function (exports) {
	'use strict';

	const a = 1;
	const b = 2;

	exports.a = a;
	exports.b = b;

	return exports;

})({});
