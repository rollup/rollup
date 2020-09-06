var iife = (function (exports) {
	'use strict';

	var self = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
		__proto__: null,
		[Symbol.toStringTag]: 'Module',
		get p () { return p; }
	}, '__esModule', { value: true }));

	console.log(Object.keys(self));

	var p = 5;

	exports.p = p;

	return exports;

}({}));
