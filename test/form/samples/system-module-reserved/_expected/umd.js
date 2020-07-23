(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('test')) :
	typeof define === 'function' && define.amd ? define(['test'], factory) :
	factory(global.test);
}(typeof globalThis !== 'undefined' ? globalThis : this || self, (function (test) { 'use strict';

	console.log(test.module, test.other);

})));
