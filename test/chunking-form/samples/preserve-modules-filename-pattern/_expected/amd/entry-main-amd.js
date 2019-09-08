define(['exports', './entry-foo-amd', './nested/entry-bar-amd', './nested/entry-baz-amd'], function (exports, foo, bar, baz) { 'use strict';



	exports.foo = foo.default;
	exports.bar = bar.default;
	exports.baz = baz.default;

	Object.defineProperty(exports, '__esModule', { value: true });

});
