(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	factory(global.libraryName = {});
}(typeof self !== 'undefined' ? self : this, function (exports) { 'use strict';

	const valueOnLib = 42;

	exports.valueOnLib = valueOnLib;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
