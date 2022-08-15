System.register(['./foo', 'baz/quux'], (function () {
	'use strict';
	var foo, baz;
	return {
		setters: [function (module) {
			foo = module["default"];
		}, function (module) {
			baz = module["default"];
		}],
		execute: (function () {

			const bar = 42;

			console.log(foo, bar, baz);

		})
	};
}));
