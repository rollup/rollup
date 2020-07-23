(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('x')) :
	typeof define === 'function' && define.amd ? define(['exports', 'x'], factory) :
	factory(global.myBundle = {}, global.x);
}(typeof globalThis !== 'undefined' ? globalThis : this || self, (function (exports, x) { 'use strict';

	x = x && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;



	exports.x = x;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
