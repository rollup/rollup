var myBundle = (function (exports) {
	'use strict';

	var foo = 1;
	var bar = 2;

	exports.bar = bar;
	exports.foo = foo;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

}({}));
