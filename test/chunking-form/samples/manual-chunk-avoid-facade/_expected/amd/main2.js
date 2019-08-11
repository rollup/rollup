define(['exports'], function (exports) { 'use strict';

	const value = 42;

	console.log('main2', value);

	exports.reexported = value;

	Object.defineProperty(exports, '__esModule', { value: true });

});
