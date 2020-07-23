(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}));
}(this, (function (exports) { 'use strict';

	const foo = 'foo1';
	const bar = 'bar1';

	var dep = /*#__PURE__*/Object.freeze({
		__proto__: null,
		foo: foo,
		bar: bar
	});

	exports.dep = dep;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
