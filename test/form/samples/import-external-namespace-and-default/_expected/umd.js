(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('foo')) :
	typeof define === 'function' && define.amd ? define(['foo'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.foo));
}(this, (function (foo) { 'use strict';

	var foo__default = 'default' in foo ? foo['default'] : foo;

	console.log( foo.bar );

	console.log( foo__default );

})));
