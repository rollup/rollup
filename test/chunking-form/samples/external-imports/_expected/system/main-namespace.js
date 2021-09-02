System.register(['external-all', 'external-namespace', 'external-default-namespace', 'external-named-namespace'], (function () {
	'use strict';
	var foo, bar, quux, quux$1;
	return {
		setters: [function (module) {
			foo = module;
		}, function (module) {
			bar = module;
		}, function (module) {
			quux = module;
		}, function (module) {
			quux$1 = module;
		}],
		execute: (function () {

			console.log(foo, bar, quux, quux$1);

		})
	};
}));
