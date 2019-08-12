System.register(['./generated-broken.js', './generated-foo.js', './generated-bar.js'], function () {
	'use strict';
	var broken, foo, bar;
	return {
		setters: [function (module) {
			broken = module.b;
		}, function (module) {
			foo = module.f;
		}, function (module) {
			bar = module.b;
		}],
		execute: function () {

			foo();
			broken();
			bar();
			broken();

		}
	};
});
