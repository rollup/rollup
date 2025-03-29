System.register(['./generated-lib1.js'], (function () {
	'use strict';
	var value1, bar, value2;
	return {
		setters: [function (module) {
			value1 = module.value1;
			bar = module.bar;
			value2 = module.value2;
		}],
		execute: (function () {

			console.log(value1);
			console.log(bar);
			console.log(value2);
			console.log(bar);

		})
	};
}));
