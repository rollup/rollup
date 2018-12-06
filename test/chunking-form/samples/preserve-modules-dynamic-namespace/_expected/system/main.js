System.register(['./m1.js'], function (exports, module) {
	'use strict';
	var ms;
	return {
		setters: [function (module) {
			ms = module;
		}],
		execute: function () {

			console.log(ms);

		}
	};
});
