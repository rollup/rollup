System.register(['./chunk1.js', './chunk3.js'], function (exports, module) {
	'use strict';
	var num, num$1;
	return {
		setters: [function (module) {
			num = module.num;
		}, function (module) {
			num$1 = module.num;
		}],
		execute: function () {

			console.log(num + num$1);

		}
	};
});
