System.register('bundle', ['./sub/index.js'], (function (exports) {
	'use strict';
	var bar;
	return {
		setters: [function (module) {
			bar = module.default;
			exports('foo', module.foo);
		}],
		execute: (function () {

			const baz = exports("baz", { bar });

		})
	};
}));
