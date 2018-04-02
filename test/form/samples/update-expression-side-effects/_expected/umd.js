(function (global, factory) {
	typeof module === 'object' && module.exports ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	const effectY = () => {
		console.log('effect');
		return 'y';
	};

	const x = {y: 1};
	x[effectY()]++;

	let foo = {bar: {}};
	foo++;
	foo.bar.baz = 1;

})));
