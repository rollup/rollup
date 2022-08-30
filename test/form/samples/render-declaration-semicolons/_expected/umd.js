(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}));
})(this, (function (exports) { 'use strict';

	var a, b;
	console.log(a, b);

	var c, d;
	console.log(c, d);

	const e = 1, f = 2;
	console.log(e, f);

	const g = 3, h = 4;
	console.log(g, h);

	var i, j;

	var k, l;

	const m = 1, n = 2;

	const o = 3, p = 4;

	exports.i = i;
	exports.j = j;
	exports.k = k;
	exports.l = l;
	exports.m = m;
	exports.n = n;
	exports.o = o;
	exports.p = p;

}));
