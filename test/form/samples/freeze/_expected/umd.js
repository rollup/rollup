(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	factory(global.myBundle = {});
}(typeof globalThis !== 'undefined' ? globalThis : this || self, (function (exports) { 'use strict';

	const foo = 1;
	const bar = 2;

	var namespace = {
		__proto__: null,
		foo: foo,
		bar: bar
	};

	console.log( Object.keys( namespace ) );

	const a = 1;
	const b = 2;

	exports.a = a;
	exports.b = b;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
