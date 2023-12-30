System.register(['./main.js'], (function (exports) {
	'use strict';
	var value;
	return {
		setters: [function (module) {
			value = module.value;
			exports("value", module.value);
		}],
		execute: (function () {

			console.log('dynamic2', value);

		})
	};
}));
