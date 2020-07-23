(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.libraryName = {}));
}(this, (function (exports) { 'use strict';

	const valueOnLib = 42;

	exports.valueOnLib = valueOnLib;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
