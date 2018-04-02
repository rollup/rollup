(function (global, factory) {
	typeof module === 'object' && module.exports ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.myBundle = {})));
}(this, (function (exports) { 'use strict';

	const isNaN$1 = isNaN;

	exports.isNaN = isNaN$1;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
