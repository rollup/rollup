System.register(['./chunk2.js', './chunk1.js', './chunk3.js'], function (exports, module) {
	'use strict';
	var x, y;
	return {
		setters: [function (module) {
			x = module.default;
			y = module.default$1;
		}, function (module) {
			
		}, function (module) {
			
		}],
		execute: function () {

			console.log(x + y);

		}
	};
});
