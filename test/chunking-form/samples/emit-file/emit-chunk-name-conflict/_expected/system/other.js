System.register(['./generated-name.js', './generated-secondName.js', './generated-name2.js'], function () {
	'use strict';
	var value1, value2;
	return {
		setters: [function (module) {
			value1 = module.default;
		}, function (module) {
			value2 = module.default;
		}, function () {}],
		execute: function () {

			console.log('main', value1, value2, value3);

		}
	};
});
