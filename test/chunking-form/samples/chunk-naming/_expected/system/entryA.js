System.register(['./chunks/chunk.js', './chunks/chunk2.js'], function (exports, module) {
	'use strict';
	var num, num$1;
	return {
		setters: [function (module) {
			num = module.n;
		}, function (module) {
			num$1 = module.n;
		}],
		execute: function () {

			console.log(num + num$1);

		}
	};
});
