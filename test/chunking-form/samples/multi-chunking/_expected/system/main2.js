System.register(['./chunk-30fb479a.js', './chunk-c3499ea0.js'], function (exports, module) {
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
