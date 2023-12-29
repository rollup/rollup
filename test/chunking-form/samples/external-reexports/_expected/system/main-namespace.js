System.register(['external-all', 'external-namespace', 'external-default-namespace', 'external-named-namespace'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("foo", module);
		}, function (module) {
			exports("bar", module);
		}, function (module) {
			exports("baz", module);
		}, function (module) {
			exports("quux", module);
		}],
		execute: (function () {

			const externalNamespace = 1;
			const externalNamespace__ns = 1;
			console.log(externalNamespace, externalNamespace__ns);

		})
	};
}));
