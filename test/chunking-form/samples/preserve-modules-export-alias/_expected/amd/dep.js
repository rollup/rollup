define(['exports'], function (exports) { 'use strict';

	const foo = 1;

	exports.foo = foo;
	exports.bar = foo;

	Object.defineProperty(exports, '__esModule', { value: true });

});
