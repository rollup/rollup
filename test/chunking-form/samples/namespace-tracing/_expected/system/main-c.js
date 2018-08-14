System.register(['./chunk-adb756c4.js', './chunk-4b433a97.js'], function (exports, module) {
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
