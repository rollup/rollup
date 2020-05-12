define(['exports', './sub/index'], function (exports, index$1) { 'use strict';

	const baz = { bar: index$1.default };

	exports.foo = index$1.foo;
	exports.baz = baz;

	Object.defineProperty(exports, '__esModule', { value: true });

});
