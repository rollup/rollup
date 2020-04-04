define(['exports'], function (exports) { 'use strict';

	var self = /*#__PURE__*/Object.freeze({
		__proto__: null,
		[Symbol.toStringTag]: 'Module',
		get p () { return p; }
	});

	console.log(Object.keys(self));

	var p = 5;

	exports.p = p;

	Object.defineProperty(exports, '__esModule', { value: true });

});
