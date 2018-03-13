(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('other')) :
	typeof define === 'function' && define.amd ? define(['other'], factory) :
	(global.myBundle = factory(global.other));
}(this, (function (other) { 'use strict';

	const a = 1;
	const b = 2;

	const namespace = Object.freeze({
		a: a,
		b: b
	});

	console.log( Object.keys( namespace ) );
	console.log( other.name );

	const main = 42;

	return main;

})));
