System.register(['./generated-broken.js', './generated-bar.js'], function () {
	'use strict';
	var broken, bar;
	return {
		setters: [function (module) {
			broken = module.b;
		}, function (module) {
			bar = module.b;
		}],
		execute: function () {

			bar();
			broken();

		}
	};
});
