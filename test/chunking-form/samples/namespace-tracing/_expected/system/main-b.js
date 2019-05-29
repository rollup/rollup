System.register(['./generated-chunk.js', './generated-chunk2.js', './generated-chunk3.js'], function () {
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
