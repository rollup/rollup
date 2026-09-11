var iife = (function (exports) {
	'use strict';

	var self = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
		get p () { return p; }
	}, null));

	console.log(Object.keys(self));

	var p = 5;

	exports.p = p;

	return exports;

})({});
