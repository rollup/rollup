define(['exports', './entry-foo-amd-ts.ts', './entry-nested/bar-amd-ts.ts', './entry-nested/baz-amd-ts.ts', './entry-no-ext-amd-'], (function (exports, foo, bar, baz, noExt) { 'use strict';



	exports.foo = foo;
	exports.bar = bar;
	exports.baz = baz;
	exports.noExt = noExt;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
