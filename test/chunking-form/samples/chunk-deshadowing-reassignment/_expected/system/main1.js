System.register(['./chunk2.js'], function (exports, module) {
	'use strict';
	var x, y;
	return {
		setters: [function (module) {
			x = module.default;
			y = module.default$1;
		}],
		execute: function () {

			console.log(x + y);

		}
	};
});
