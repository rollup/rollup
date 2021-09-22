System.register(['./generated-foo.js', './generated-broken.js'], (function () {
	'use strict';
	var foo, broken;
	return {
		setters: [function (module) {
			foo = module.f;
		}, function (module) {
			broken = module.b;
		}],
		execute: (function () {

			foo();
			broken();

		})
	};
}));
