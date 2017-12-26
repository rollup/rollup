(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('bar'), require('foo')) :
	typeof define === 'function' && define.amd ? define(['bar', 'foo'], factory) :
	(factory(global.bar,global.foo));
}(this, (function (bar,foo) { 'use strict';

	console.log( bar.a );

	console.log( foo.a );

})));