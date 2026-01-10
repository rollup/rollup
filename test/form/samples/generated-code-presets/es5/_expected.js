System.register('bundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const foo = 1; exports({ bar: foo, default: foo, foo: foo });

		})
	};
}));
