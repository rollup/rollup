System.register(['external-all', 'external-named', 'external-default-named', 'external-named-namespace'], (function () {
	'use strict';
	var foo, bar, baz, quux;
	return {
		setters: [function (module) {
			foo = module.foo;
		}, function (module) {
			bar = module.bar;
		}, function (module) {
			baz = module.baz;
		}, function (module) {
			quux = module.quux;
		}],
		execute: (function () {

			console.log(foo, bar, baz, quux);

		})
	};
}));
