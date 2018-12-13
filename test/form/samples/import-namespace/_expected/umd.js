(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('foo'), require('bar')) :
	typeof define === 'function' && define.amd ? define(['foo', 'bar'], factory) :
	factory(global.foo,global.bar);
}(typeof self !== 'undefined' ? self : this, function (foo,bar) { 'use strict';

	foo.x();
	console.log(bar);

}));
