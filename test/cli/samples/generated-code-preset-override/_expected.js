System.register(['external'], (function (exports) {
	'use strict';
	return {
		setters: [module => {
			exports("baz", module.baz);
		}],
		execute: (function () {

			const foo = 1; exports({ __proto__: null, foo: foo, bar: foo, default: foo });

		})
	};
}));
