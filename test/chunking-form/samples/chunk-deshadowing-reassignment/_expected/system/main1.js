System.register(['./generated-chunk.js', './generated-chunk2.js', './generated-chunk3.js'], function (exports, module) {
	'use strict';
	var x, y;
	return {
		setters: [function () {}, function (module) {
			x = module.x;
			y = module.y;
		}, function () {}],
		execute: function () {

			console.log(x + y);

		}
	};
});
