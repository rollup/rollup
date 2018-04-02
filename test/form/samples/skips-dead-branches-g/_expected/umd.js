(function (global, factory) {
	typeof module === 'object' && module.exports ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	var a = 0;
	var b = 1;

	var x = a;
	var y = b;

	console.log( x + y );

})));
