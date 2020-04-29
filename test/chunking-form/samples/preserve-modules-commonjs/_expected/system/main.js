System.register(['external', './commonjs.js'], function () {
	'use strict';
	var external, commonjs;
	return {
		setters: [function (module) {
			external = module.default;
		}, function (module) {
			commonjs = module.default;
		}],
		execute: function () {

			console.log(commonjs, external);

		}
	};
});
