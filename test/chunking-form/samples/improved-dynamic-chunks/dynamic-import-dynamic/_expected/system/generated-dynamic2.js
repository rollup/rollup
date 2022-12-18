System.register(['./generated-dynamic1.js'], (function (exports) {
	'use strict';
	var value;
	return {
		setters: [function (module) {
			value = module.value;
		}],
		execute: (function () {

			console.log('dynamic2', value);

		})
	};
}));
