(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.foo = {}));
})(this, (function (exports) { 'use strict';

	const make1 = () => {};

	const make2 = () => {};

	exports.make1 = make1;
	exports.make2 = make2;

}));
