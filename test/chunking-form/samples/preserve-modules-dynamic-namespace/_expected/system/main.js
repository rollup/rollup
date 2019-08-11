System.register(['./m1.js'], function () {
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
