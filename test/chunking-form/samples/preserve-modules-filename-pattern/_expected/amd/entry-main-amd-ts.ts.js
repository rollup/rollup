define(['exports', './entry-foo-amd-ts.ts', './nested/entry-bar-amd-ts.ts', './nested/entry-baz-amd-ts.ts', './entry-no-ext-amd-'], function (exports, foo, bar, baz, noExt) { 'use strict';



	exports.foo = foo.default;
	exports.bar = bar.default;
	exports.baz = baz.default;
	exports.noExt = noExt.default;

	Object.defineProperty(exports, '__esModule', { value: true });

});
