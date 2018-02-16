System.register(['./chunk2.js'], function (exports, module) {
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
