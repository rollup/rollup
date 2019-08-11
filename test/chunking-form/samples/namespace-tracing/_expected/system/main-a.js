System.register(['./generated-broken.js', './generated-foo.js'], function () {
	'use strict';
	var broken, foo;
	return {
		setters: [function (module) {
			broken = module.b;
		}, function (module) {
			foo = module.f;
		}],
		execute: function () {

			foo();
			broken();

		}
	};
});
