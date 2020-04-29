define(['exports'], function (exports) { 'use strict';

	var value = 43;

	var other = {
		value: value
	};

	exports.__moduleExports = other;
	exports.default = other;
	exports.value = value;

	Object.defineProperty(exports, '__esModule', { value: true });

});
