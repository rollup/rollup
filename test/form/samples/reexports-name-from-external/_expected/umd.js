(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external'], factory) :
	factory(global.myBundle = {},global.external);
}(typeof self !== 'undefined' ? self : this, function (exports,external) { 'use strict';

	exports.foo = external.foo;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
