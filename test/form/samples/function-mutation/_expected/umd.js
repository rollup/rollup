(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bundle = {})));
}(this, (function (exports) { 'use strict';

	function foo () {
		console.log( 'foo' );
	}

	function a () {
		console.log( 'a' );
	}

	a.foo = foo;

	const bar = function () {
		console.log( 'bar' );
	};

	const c = function () {
		console.log( 'c' );
	};

	c.bar = bar;

	const baz = () => console.log( 'baz' );

	const e = () => console.log( 'c' );

	e.baz = baz;

	exports.a = a;
	exports.c = c;
	exports.e = e;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
