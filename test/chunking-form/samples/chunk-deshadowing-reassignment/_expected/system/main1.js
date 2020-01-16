System.register(['./generated-shared2.js'], function () {
	'use strict';
	var x, y;
	return {
		setters: [function (module) {
			x = module.x;
			y = module.y;
		}],
		execute: function () {

			console.log(x + y);

		}
	};
});
