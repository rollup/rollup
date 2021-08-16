(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}));
})(this, (function (exports) { 'use strict';

	var other = {
		foo: 'bar'
	};

	var ns = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), other, {
		default: other
	}));

	console.log(ns, other.foo, other.function, other["some-prop"]);
	console.log(undefined, undefined);

	exports.function = 1;
	exports.function++;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
