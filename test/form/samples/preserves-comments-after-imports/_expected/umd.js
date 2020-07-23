(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.myBundle = {}));
}(this, (function (exports) { 'use strict';

	/** A comment for a number */
	var number = 5;

	/** A comment for obj */
	var obj = { number };

	exports.obj = obj;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
