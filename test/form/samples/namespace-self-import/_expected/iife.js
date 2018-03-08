var iife = (function (exports) {
	'use strict';

	var self = Object.freeze({
		get p () { return p$$1; }
	});

	console.log(Object.keys(self));

	var p$$1 = 5;

	exports.p = p$$1;

	return exports;

}({}));
