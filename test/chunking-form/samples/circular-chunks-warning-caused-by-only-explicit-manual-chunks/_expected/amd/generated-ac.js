define(['exports', './main'], (function (exports, main) { 'use strict';

	const c = 'c';
	console.log(c);

	const a = 'a';
	console.log(a + main.b);

	exports.a = a;
	exports.c = c;

}));
