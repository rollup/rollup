(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.myBundle = {})));
}(this, (function (exports) { 'use strict';

	const isNaN$1 = isNaN;

	exports.isNaN = isNaN$1;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
