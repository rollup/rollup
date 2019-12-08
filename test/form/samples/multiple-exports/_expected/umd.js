(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.myBundle = {}));
}(this, (function (exports) { 'use strict';

	var foo = 1;
	var bar = 2;

	exports.bar = bar;
	exports.foo = foo;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
