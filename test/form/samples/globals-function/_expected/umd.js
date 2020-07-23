(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('a'), require('b')) :
	typeof define === 'function' && define.amd ? define(['a', 'b'], factory) :
	factory(global.thisIsA, global.thisIsB);
}(typeof globalThis !== 'undefined' ? globalThis : this || self, (function (a, b) { 'use strict';

	a = a && Object.prototype.hasOwnProperty.call(a, 'default') ? a['default'] : a;
	b = b && Object.prototype.hasOwnProperty.call(b, 'default') ? b['default'] : b;

	console.log(a, b);

})));
