define(['exports', 'external'], (function (exports, external) { 'use strict';

	function a () {}
	function b () {}

	Object.defineProperty(exports, "'x", {
		enumerable: true,
		get: function () { return external.x; }
	});
	exports["'a"] = a;
	exports["'b"] = b;

}));
