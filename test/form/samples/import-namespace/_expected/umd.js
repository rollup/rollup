(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('foo'), require('bar')) :
	typeof define === 'function' && define.amd ? define(['foo', 'bar'], factory) :
	(global = global || self, factory(global.foo, global.bar));
}(this, (function (foo, bar) { 'use strict';

	foo.x();
	console.log(bar);

})));
