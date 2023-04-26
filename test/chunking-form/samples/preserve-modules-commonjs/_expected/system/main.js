System.register(['./commonjs.js', 'external'], (function () {
	'use strict';
	var value, require$$0;
	return {
		setters: [function (module) {
			value = module.default;
		}, function (module) {
			require$$0 = module.default;
		}],
		execute: (function () {

			console.log(value, require$$0);

		})
	};
}));
