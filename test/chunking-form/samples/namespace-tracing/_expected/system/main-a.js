System.register(['./chunk-4b433a97.js', './chunk-daa4308b.js'], function (exports, module) {
	'use strict';
	var broken, foo;
	return {
		setters: [function (module) {
			broken = module.a;
		}, function (module) {
			foo = module.a;
		}],
		execute: function () {

			foo();
			broken();

		}
	};
});
