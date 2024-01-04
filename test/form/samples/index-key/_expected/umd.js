(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('x')) :
	typeof define === 'function' && define.amd ? define(['x'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.x));
})(this, (function (x$1) { 'use strict';

	var x = /*#__PURE__*/Object.freeze({
		__proto__: null,
		"00": x$1["00"],
		"9007199254740993": x$1["9007199254740993"]
	});

	console.log(x);

}));
