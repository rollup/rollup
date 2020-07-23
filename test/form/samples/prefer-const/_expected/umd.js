(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('other')) :
	typeof define === 'function' && define.amd ? define(['other'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.myBundle = factory(global.other));
}(this, (function (other) { 'use strict';

	const a = 1;
	const b = 2;

	const namespace = /*#__PURE__*/Object.freeze({
		__proto__: null,
		a: a,
		b: b
	});

	console.log( Object.keys( namespace ) );
	console.log( other.name );

	const main = 42;

	return main;

})));
