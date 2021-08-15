define(['exports'], (function (exports) { 'use strict';

	const value = 42;

	console.log(value);

	exports.value = value;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
