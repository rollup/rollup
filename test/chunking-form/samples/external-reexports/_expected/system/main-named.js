System.register(['external-all', 'external-named', 'external-default-named', 'external-named-namespace'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("foo", module.foo);
		}, function (module) {
			exports("bar", module.bar);
		}, function (module) {
			exports("baz", module.baz);
		}, function (module) {
			exports("quux", module.quux);
		}],
		execute: (function () {



		})
	};
}));
