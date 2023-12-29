var bundle = (function (exports, x) {
	'use strict';

	const y = 1;

	function a () {}
	function b () {}

	exports["'x"] = x.x;
	exports["'a"] = a;
	exports["'b"] = b;
	exports["'y"] = y;

	return exports;

})({}, x);
