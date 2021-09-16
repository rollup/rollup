(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external1'), require('external2')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external1', 'external2'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}, global.external1, global.external2));
})(this, (function (exports, external1, external2) { 'use strict';

	const dynamic = import('external3');

	exports.external1 = external1.external1;
	exports.dynamic = dynamic;
	for (var k in external2) {
		if (k !== 'default' && !exports.hasOwnProperty(k)) exports[k] = external2[k];
	}

	Object.defineProperty(exports, '__esModule', { value: true });

}));
