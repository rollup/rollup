(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external'], factory) :
	(factory((global.bundle = {}),global.myExternal));
}(this, (function (exports,myExternal) { 'use strict';

	myExternal = myExternal && myExternal.hasOwnProperty('default') ? myExternal['default'] : myExternal;

	const test = () => myExternal;

	const someDynamicImport = () => import('external');

	exports.test = test;
	exports.someDynamicImport = someDynamicImport;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
