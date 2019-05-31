System.register(['external', './commonjs.js'], function () {
	'use strict';
	var external, value;
	return {
		setters: [function (module) {
			external = module.default;
		}, function (module) {
			value = module.default;
		}],
		execute: function () {

			console.log(value, external);

		}
	};
});
