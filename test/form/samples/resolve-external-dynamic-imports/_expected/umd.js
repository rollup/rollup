(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external'], factory) :
	(global = global || self, factory(global.bundle = {}, global.myExternal));
}(this, (function (exports, myExternal) { 'use strict';

	myExternal = myExternal && Object.prototype.hasOwnProperty.call(myExternal, 'default') ? myExternal['default'] : myExternal;

	const test = () => myExternal;

	const someDynamicImport = () => import('external');

	exports.someDynamicImport = someDynamicImport;
	exports.test = test;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
