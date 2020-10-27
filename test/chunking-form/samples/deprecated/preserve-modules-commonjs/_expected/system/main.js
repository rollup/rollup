System.register(['./commonjs.js', 'external'], function () {
	'use strict';
	var commonjs, external;
	return {
		setters: [function (module) {
			commonjs = module.default;
		}, function (module) {
			external = module.default;
		}],
		execute: function () {

			console.log(commonjs, external);

		}
	};
});
