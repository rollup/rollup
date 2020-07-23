(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.myBundle = {}));
}(this, (function (exports) { 'use strict';

	const localIsNaN = isNaN;

	const isNaN$1 = localIsNaN;

	exports.isNaN = isNaN$1;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
