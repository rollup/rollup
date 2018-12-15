System.register(['./generated-chunk.js', './generated-chunk2.js', './generated-chunk3.js'], function (exports, module) {
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
