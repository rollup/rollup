System.register(['external-all', 'external-default', 'external-default-named', 'external-default-namespace'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("foo", module.default);
		}, function (module) {
			exports("bar", module.default);
		}, function (module) {
			exports("baz", module.default);
		}, function (module) {
			exports("quux", module.default);
		}],
		execute: (function () {



		})
	};
}));
