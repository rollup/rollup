System.register(['./chunk-daa4308b.js', './chunk-4b433a97.js'], function (exports, module) {
	'use strict';
	var foo, broken;
	return {
		setters: [function (module) {
			foo = module.a;
		}, function (module) {
			broken = module.a;
		}],
		execute: function () {

			foo();
			broken();

		}
	};
});
