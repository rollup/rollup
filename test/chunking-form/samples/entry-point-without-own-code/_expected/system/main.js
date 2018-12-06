System.register(['./m1-1f88c681.js', './m2.js'], function (exports, module) {
	'use strict';
	var ms;
	return {
		setters: [function (module) {
			ms = module.a;
		}, function () {}],
		execute: function () {

			console.log(ms);

		}
	};
});
