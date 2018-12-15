System.register(['./m2.js', './generated-m1.js'], function (exports, module) {
	'use strict';
	var ms;
	return {
		setters: [function () {}, function (module) {
			ms = module.a;
		}],
		execute: function () {

			console.log(ms);

		}
	};
});
