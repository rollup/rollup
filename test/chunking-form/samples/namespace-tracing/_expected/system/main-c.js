System.register(['./chunk-4b433a97.js', './chunk-adb756c4.js'], function (exports, module) {
	'use strict';
	var broken, bar;
	return {
		setters: [function (module) {
			broken = module.a;
		}, function (module) {
			bar = module.a;
		}],
		execute: function () {

			bar();
			broken();

		}
	};
});
