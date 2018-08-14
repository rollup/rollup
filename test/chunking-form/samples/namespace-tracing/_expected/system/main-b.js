System.register(['./chunk-daa4308b.js', './chunk-adb756c4.js', './chunk-4b433a97.js'], function (exports, module) {
	'use strict';
	var foo, bar, broken;
	return {
		setters: [function (module) {
			foo = module.a;
		}, function (module) {
			bar = module.a;
		}, function (module) {
			broken = module.a;
		}],
		execute: function () {

			foo();
			broken();
			bar();
			broken();

		}
	};
});
