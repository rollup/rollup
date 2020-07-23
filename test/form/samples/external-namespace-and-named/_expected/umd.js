(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('foo')) :
	typeof define === 'function' && define.amd ? define(['foo'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.foo));
}(this, (function (foo) { 'use strict';

	console.log(foo);
	console.log(foo.blah);
	console.log(foo.bar);

})));
