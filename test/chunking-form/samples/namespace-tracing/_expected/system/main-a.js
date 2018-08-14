System.register(['./chunk-30de4b27.js', './chunk-0cb14c61.js'], function (exports, module) {
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
