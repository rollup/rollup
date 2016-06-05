(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('external'), require('other'), require('another')) :
	typeof define === 'function' && define.amd ? define(['external', 'other', 'another'], factory) :
	(global.myBundle = factory(global.external,global.other,global.another));
}(this, function (external,other,another) { 'use strict';

	const a = 1;
	const b = 2;


	const namespace = Object.freeze({
		a: a,
		b: b
	});

	console.log( Object.keys( namespace ) );

	const main = 42;

	return main;

}));
