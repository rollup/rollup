define(['exports', './main'], function (exports, main) { 'use strict';

	const bar = main.foo + 'bar';

	exports.bar = bar;

	Object.defineProperty(exports, '__esModule', { value: true });

});
