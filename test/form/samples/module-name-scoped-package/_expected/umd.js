(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["@scoped/npm-package"] = global["@scoped/npm-package"] || {}));
})(this, (function (exports) { 'use strict';

	let foo = 'foo';

	exports.foo = foo;

}));
