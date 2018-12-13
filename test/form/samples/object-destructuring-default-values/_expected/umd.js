(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(typeof self !== 'undefined' ? self : this, function () { 'use strict';

	const a = 1;
	const b = 2;
	const { c = a } = {};
	const [ d = b ] = [];
	console.log(c, d);

}));
