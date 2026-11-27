System.register('bundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			let foo = exports("default", null);
			const setFoo = value => (exports("default", foo = value)); exports("setFoo", setFoo);

		})
	};
}));
