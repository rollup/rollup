(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bundle = {})));
}(this, (function (exports) { 'use strict';

	function foo () {}
	foo = 1;

	var bar = 1;
	function bar () {}

	function baz () {}
	var baz = 1;

	class quux {}
	quux = 1;

	exports.foo = foo;
	exports.bar = bar;
	exports.baz = baz;
	exports.quux = quux;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
