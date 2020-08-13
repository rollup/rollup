System.register(['external-all', 'external-default-namespace', 'external-named-namespace', 'external-namespace'], function () {
	'use strict';
	var foo, quux, quux$1, bar;
	return {
		setters: [function (module) {
			foo = module;
		}, function (module) {
			quux = module;
		}, function (module) {
			quux$1 = module;
		}, function (module) {
			bar = module;
		}],
		execute: function () {

			console.log(foo, bar, quux, quux$1);

		}
	};
});
