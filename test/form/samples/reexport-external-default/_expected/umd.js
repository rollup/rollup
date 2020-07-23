(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('external1'), require('external2')) :
	typeof define === 'function' && define.amd ? define(['external1', 'external2'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.bundle = factory(global.external1, global.external2));
}(this, (function (external1, external2) { 'use strict';

	external2 = external2 && Object.prototype.hasOwnProperty.call(external2, 'default') ? external2['default'] : external2;

	console.log(external1.foo);

	return external2;

})));
