System.register(['./generated-chunk.js', './generated-chunk2.js', './generated-chunk3.js'], function () {
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
