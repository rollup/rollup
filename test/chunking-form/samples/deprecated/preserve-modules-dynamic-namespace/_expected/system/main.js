System.register(['./m1.js'], (function () {
	'use strict';
	var m1;
	return {
		setters: [function (module) {
			m1 = module;
		}],
		execute: (function () {

			console.log(m1);

		})
	};
}));
