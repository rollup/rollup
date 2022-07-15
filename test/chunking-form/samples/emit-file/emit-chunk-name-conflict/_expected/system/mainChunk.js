System.register(['./generated-name.js', './generated-firstName.js', './generated-name2.js'], (function () {
	'use strict';
	var value1, value2, value3;
	return {
		setters: [function (module) {
			value1 = module.default;
		}, function (module) {
			value2 = module.default;
		}, function (module) {
			value3 = module.default;
		}],
		execute: (function () {

			console.log('main', value1, value2, value3);

		})
	};
}));
