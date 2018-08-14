System.register(['./chunk-30de4b27.js', './chunk-0f1d25f2.js', './chunk-0cb14c61.js'], function (exports, module) {
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
