System.register(['./chunk-4b433a97.js', './chunk-daa4308b.js', './chunk-adb756c4.js'], function (exports, module) {
	'use strict';
	var broken, foo, bar;
	return {
		setters: [function (module) {
			broken = module.a;
		}, function (module) {
			foo = module.a;
		}, function (module) {
			bar = module.a;
		}],
		execute: function () {

			foo();
			broken();
			bar();
			broken();

		}
	};
});
