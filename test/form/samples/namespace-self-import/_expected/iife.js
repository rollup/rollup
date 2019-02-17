var iife = (function (exports) {
	'use strict';

	var self = /*#__PURE__*/Object.freeze({
		get p () { return p; }
	});

	console.log(Object.keys(self));

	var p = 5;

	exports.p = p;

	return exports;

}({}));
