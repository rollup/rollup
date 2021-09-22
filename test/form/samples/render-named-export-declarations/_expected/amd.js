define(['exports'], (function (exports) { 'use strict';

	var aFoo; exports.aBar = void 0;
	exports.aBar = 2;

	exports.bFoo = void 0; var bBar;
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
