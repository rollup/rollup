var bundle = (function (exports) {
	'use strict';

	exports["default"] = null;
	const setFoo = value => (exports["default"] = value);

	exports.setFoo = setFoo;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({});
