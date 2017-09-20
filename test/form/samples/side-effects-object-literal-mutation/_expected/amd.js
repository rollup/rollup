define(['exports'], function (exports) { 'use strict';

	const x2 = { x: {} };
	x2.y = 1;
	x2.x.y = 2;

	const x3 = { x: {} };
	x3.y.z = 1;

	exports.x2 = x2;

	Object.defineProperty(exports, '__esModule', { value: true });

});
