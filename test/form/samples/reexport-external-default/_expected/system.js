System.register('bundle', ['external1', 'external2'], (function (exports) {
	'use strict';
	var foo;
	return {
		setters: [function (module) {
			foo = module.foo;
		}, function (module) {
			exports("default", module.default);
		}],
		execute: (function () {

			console.log(foo);

		})
	};
}));
