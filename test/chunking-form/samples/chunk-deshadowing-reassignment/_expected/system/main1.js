System.register(['./generated-dep1.js', './generated-shared2.js', './generated-dep2.js'], function () {
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
