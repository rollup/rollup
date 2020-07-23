(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	factory(global['@scoped/npm-package'] = global['@scoped/npm-package'] || {});
}(typeof globalThis !== 'undefined' ? globalThis : this || self, (function (exports) { 'use strict';

	let foo = 'foo';

	exports.foo = foo;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
