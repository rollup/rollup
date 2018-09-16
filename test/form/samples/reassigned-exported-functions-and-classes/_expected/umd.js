(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bundle = {})));
}(this, (function (exports) { 'use strict';

	function foo () {}
	foo = 1;

	class bar {}
	bar = 1;

	exports.foo = foo;
	exports.bar = bar;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
