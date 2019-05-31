System.register(['./generated-chunk.js', './generated-chunk3.js'], function () {
	'use strict';
	var broken, bar;
	return {
		setters: [function (module) {
			broken = module.b;
		}, function (module) {
			bar = module.b;
		}],
		execute: function () {

			bar();
			broken();

		}
	};
});
