System.register(['./generated-foo-prefix.js'], (function (exports) {
	'use strict';
	var fooPrefix;
	return {
		setters: [function (module) {
			fooPrefix = module.f;
		}],
		execute: (function () {

			const foo = exports("foo", fooPrefix + 'foo');

		})
	};
}));
