(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('test')) :
	typeof define === 'function' && define.amd ? define(['test'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.test));
}(this, (function (test) { 'use strict';

	console.log(test.module, test.other);

})));
