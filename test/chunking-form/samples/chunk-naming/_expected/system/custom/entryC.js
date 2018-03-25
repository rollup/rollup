System.register(['../chunks/chunk.js', '../chunks/chunk3.js'], function (exports, module) {
	'use strict';
	var num, num$1;
	return {
		setters: [function (module) {
			num = module.a;
		}, function (module) {
			num$1 = module.a;
		}],
		execute: function () {

			console.log(num + num$1);

		}
	};
});
