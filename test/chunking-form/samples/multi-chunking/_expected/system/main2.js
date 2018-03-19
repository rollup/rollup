System.register(['./chunk-0b7a2ab3.js', './chunk-38f206da.js'], function (exports, module) {
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
