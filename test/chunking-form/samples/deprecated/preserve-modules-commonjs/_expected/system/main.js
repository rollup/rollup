System.register(['./commonjs.js', 'external'], function () {
	'use strict';
	var commonjs, require$$0;
	return {
		setters: [function (module) {
			commonjs = module.default;
		}, function (module) {
			require$$0 = module.default;
		}],
		execute: function () {

			console.log(commonjs, require$$0);

		}
	};
});
