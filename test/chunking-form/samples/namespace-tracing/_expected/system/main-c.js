System.register(['./generated-bar.js', './generated-broken.js'], function () {
	'use strict';
	var bar, broken;
	return {
		setters: [function (module) {
			bar = module.b;
		}, function (module) {
			broken = module.b;
		}],
		execute: function () {

			bar();
			broken();

		}
	};
});
