(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	factory(global.libraryName = {});
}(typeof globalThis !== 'undefined' ? globalThis : this || self, (function (exports) { 'use strict';

	const valueOnLib = 42;

	exports.valueOnLib = valueOnLib;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
