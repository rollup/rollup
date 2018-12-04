System.register(['./m1-1f88c681.js', './m2.js'], function (exports, module) {
	'use strict';
	var ms, m2;
	return {
		setters: [function (module) {
			ms = module.a;
		}, function (module) {
			m2 = module.default;
		}],
		execute: function () {

			console.log(ms);

		}
	};
});
