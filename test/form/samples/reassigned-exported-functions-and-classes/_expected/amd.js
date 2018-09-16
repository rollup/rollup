define(['exports'], function (exports) { 'use strict';

	function foo () {}
	foo = 1;

	class bar {}
	bar = 1;

	exports.foo = foo;
	exports.bar = bar;

	Object.defineProperty(exports, '__esModule', { value: true });

});
