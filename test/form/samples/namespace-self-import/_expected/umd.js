(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.iife = {})));
}(this, (function (exports) { 'use strict';

	var self = /*#__PURE__*/Object.freeze({
		get p () { return p$$1; }
	});

	console.log(Object.keys(self));

	var p$$1 = 5;

	exports.p = p$$1;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
