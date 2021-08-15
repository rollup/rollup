System.register(['./generated-foo.js', './generated-bar.js', './generated-broken.js'], function () {
	'use strict';
	var foo, bar, broken;
	return {
		setters: [function (module) {
			foo = module.f;
		}, function (module) {
			bar = module.b;
		}, function (module) {
			broken = module.b;
		}],
		execute: function () {

			foo();
			broken();
			bar();
			broken();

		}
	};
});
