define(['exports'], (function (exports) { 'use strict';

	function foo () {}
	foo = 1;

	class bar {}
	bar = 1;

	exports.bar = bar;
	exports.foo = foo;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
