System.register(['./m2.js', './m1-1f88c681.js'], function (exports, module) {
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
