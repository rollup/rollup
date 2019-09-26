define(['exports'], function (exports) { 'use strict';

	var self = /*#__PURE__*/Object.freeze({
		[Symbol.toStringTag]: 'Module',
		__proto__: null,
		get p () { return p; }
	});

	console.log(Object.keys(self));

	var p = 5;

	exports.p = p;

	Object.defineProperty(exports, '__esModule', { value: true });

});
