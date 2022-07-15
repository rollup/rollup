System.register(['external-all', 'external-default', 'external-default-named', 'external-default-namespace'], (function () {
	'use strict';
	var foo__default, bar, baz, quux__default;
	return {
		setters: [function (module) {
			foo__default = module.default;
		}, function (module) {
			bar = module.default;
		}, function (module) {
			baz = module.default;
		}, function (module) {
			quux__default = module.default;
		}],
		execute: (function () {

			console.log(foo__default, bar, baz, quux__default);

		})
	};
}));
