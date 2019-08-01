(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external1'), require('external2')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external1', 'external2'], factory) :
	(global = global || self, factory(global.bundle = {}, global.external1, global.external2));
}(this, function (exports, external1, external2) { 'use strict';

	const dynamic = import('external3');

	Object.keys(external2).forEach(function (k) {
		if (k !== 'default') exports[k] = external2[k];
	});
	exports.external1 = external1.external1;
	exports.dynamic = dynamic;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
