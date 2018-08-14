System.register(['./chunk-0f1d25f2.js', './chunk-0cb14c61.js'], function (exports, module) {
	'use strict';
	var bar, broken;
	return {
		setters: [function (module) {
			bar = module.a;
		}, function (module) {
			broken = module.a;
		}],
		execute: function () {

			bar();
			broken();

		}
	};
});
