(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	factory((global.exposedInternals = {}));
}(this || (typeof window !== 'undefined' && window), function (exports) { 'use strict';

	const a = 1;
	const b = 2;
	var internal = 42;

	exports.a = a;
	exports.b = b;
	exports['default'] = internal;

}));
