System.register('bundle', ['external1', 'external2'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("foo", module.foo);
		}, function (module) {
			exports("bar", module.foo);
		}],
		execute: (function () {



		})
	};
}));
