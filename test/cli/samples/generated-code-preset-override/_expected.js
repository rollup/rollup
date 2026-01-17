System.register(['external'], (function (exports) {
	'use strict';
	return {
		setters: [module => {
			exports("baz", module.baz);
		}],
		execute: (function () {

			const foo = 1; exports({ bar: foo, default: foo, foo: foo });

		})
	};
}));
