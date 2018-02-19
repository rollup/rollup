System.register(['./chunk2.js'], function (exports, module) {
	'use strict';
	var x, y;
	return {
		setters: [function (module) {
			x = module.a;
			y = module.b;
		}],
		execute: function () {

			console.log(x + y);

		}
	};
});
