(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.myBundle = {})));
}(this, (function (exports) { 'use strict';

	const x2 = { x: {} };
	x2.y = 1;
	x2.x.y = 2;

	const x3 = { x: {} };
	x3.y.z = 1;

	exports.x2 = x2;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
