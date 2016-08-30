(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('x')) :
	typeof define === 'function' && define.amd ? define(['exports', 'x'], factory) :
	(factory((global.myBundle = global.myBundle || {}),global.x));
}(this, (function (exports,x) { 'use strict';

	x = 'default' in x ? x['default'] : x;



	exports.x = x;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
