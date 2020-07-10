(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('x')) :
	typeof define === 'function' && define.amd ? define(['exports', 'x'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.myBundle = {}, global.x));
}(this, (function (exports, x) { 'use strict';

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

	x = _interopDefault(x);



	exports.x = x;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
