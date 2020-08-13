System.register(['external-all', 'external-default-named', 'external-named', 'external-named-namespace'], function () {
	'use strict';
	var foo, baz, bar, quux;
	return {
		setters: [function (module) {
			foo = module.foo;
		}, function (module) {
			baz = module.baz;
		}, function (module) {
			bar = module.bar;
		}, function (module) {
			quux = module.quux;
		}],
		execute: function () {

			console.log(foo, bar, baz, quux);

		}
	};
});
