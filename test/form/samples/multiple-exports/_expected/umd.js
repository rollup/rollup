(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	factory(global.myBundle = {});
}(typeof self !== 'undefined' ? self : this, function (exports) { 'use strict';

	var foo = 1;
	var bar = 2;

	exports.foo = foo;
	exports.bar = bar;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
