define(['exports', './entry-foo-amd-ts.ts', './nested/entry-bar-amd-ts.ts', './nested/entry-baz-amd-ts.ts', './entry-lorem-amd-str.str.str', './entry-no-ext-amd-'], (function (exports, foo, bar, baz, lorem, noExt) { 'use strict';



	exports.foo = foo;
	exports.bar = bar;
	exports.baz = baz;
	exports.lorem = lorem;
	exports.noExt = noExt;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
