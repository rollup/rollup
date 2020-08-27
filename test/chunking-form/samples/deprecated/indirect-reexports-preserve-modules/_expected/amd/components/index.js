define(['exports', './sub/index'], function (exports, index) { 'use strict';

	const baz = { bar: index['default'] };

	exports.foo = index.foo;
	exports.baz = baz;

	Object.defineProperty(exports, '__esModule', { value: true });

});
