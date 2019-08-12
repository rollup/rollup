(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.bundle = {}));
}(this, function (exports) { 'use strict';

	var aFoo;
	exports.aBar = 2;

	var bBar;
	exports.bFoo = 2;

	var cFoo; exports.cBar = 1;
	exports.cBar = 2;

	exports.dFoo = 1; var dBar;
	exports.dFoo = 2;

	exports.aFoo = aFoo;
	exports.bBar = bBar;
	exports.cFoo = cFoo;
	exports.dBar = dBar;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
