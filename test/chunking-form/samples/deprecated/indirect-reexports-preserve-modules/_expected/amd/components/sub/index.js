define(['exports'], function (exports) { 'use strict';

	const foo = 'bar';
	var bar = () => {};

	exports.default = bar;
	exports.foo = foo;

	Object.defineProperty(exports, '__esModule', { value: true });

});
