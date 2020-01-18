System.register(['./_virtual/_one.js', './_virtual/_One2.js', './_virtual/_One1.js'], function () {
	'use strict';
	var a, b, c;
	return {
		setters: [function (module) {
			a = module.default;
		}, function (module) {
			b = module.default;
		}, function (module) {
			c = module.default;
		}],
		execute: function () {

			window.APP = { a, b, c };

		}
	};
});
