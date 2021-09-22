var foo = (function (exports) {
	'use strict';

	const make1 = () => {};

	const make2 = () => {};

	exports.make1 = make1;
	exports.make2 = make2;

	return exports;

})({});
