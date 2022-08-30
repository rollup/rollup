var bundle = (function (exports) {
	'use strict';

	const a = window.config ? 1 : 2;
	const b = 1 ;
	const c = 2;

	exports.a = a;
	exports.b = b;
	exports.c = c;

	return exports;

})({});
