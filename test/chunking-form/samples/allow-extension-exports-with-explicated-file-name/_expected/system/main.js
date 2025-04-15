System.register(['./lib1.js'], (function () {
	'use strict';
	var value1, value2;
	return {
		setters: [function (module) {
			value1 = module.value1;
			value2 = module.v;
		}],
		execute: (function () {

			console.log(value1, value2);

		})
	};
}));
