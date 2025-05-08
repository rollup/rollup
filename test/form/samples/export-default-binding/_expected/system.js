System.register('myBundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			let value = exports("default", 0);
			console.log(value);
			exports("default", value = 1);

		})
	};
}));
