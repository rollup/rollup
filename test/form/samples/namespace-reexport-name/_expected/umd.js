(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}, global.external));
})(this, (function (exports, external) { 'use strict';

	const renamedIndirectOverride = external.indirectOverride;

	Object.defineProperty(exports, 'renamedDirectOverride', {
		enumerable: true,
		get: function () { return external.directOverride; }
	});
	exports.renamedIndirectOverride = renamedIndirectOverride;
	Object.keys(external).forEach(function (k) {
		if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () { return external[k]; }
		});
	});

}));
