(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('a'), require('b'), require('c')) :
	typeof define === 'function' && define.amd ? define(['exports', 'a', 'b', 'c'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}, global.a, global.b, global.c));
})(this, (function (exports, a, b, c) { 'use strict';

	console.log(a.a, b.b);

	import('d').then(console.log);

	Object.defineProperty(exports, 'c', {
		enumerable: true,
		get: function () { return c.c; }
	});

}));
