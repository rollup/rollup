(function (global, factory) {
	typeof module === 'object' && module.exports ? factory(require('foo'), require('bar')) :
	typeof define === 'function' && define.amd ? define(['foo', 'bar'], factory) :
	(factory(global.foo,global.bar));
}(this, (function (foo,bar) { 'use strict';

	foo.x();
	console.log(bar);

})));
