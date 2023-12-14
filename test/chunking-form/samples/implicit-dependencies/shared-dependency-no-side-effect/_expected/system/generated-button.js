System.register(['./main.js'], (function (exports) {
	'use strict';
	var foo;
	return {
		setters: [function (module) {
			foo = module.foo;
		}],
		execute: (function () {

			const bar = exports("bar", foo + 'bar');

		})
	};
}));
