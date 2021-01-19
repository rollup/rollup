System.register(['./generated-shared2.js', './generated-dep1.js', './generated-dep2.js'], function () {
	'use strict';
	var x, y;
	return {
		setters: [function (module) {
			x = module.x;
			y = module.y;
		}, function () {}, function () {}],
		execute: function () {

			console.log(x + y);

		}
	};
});
