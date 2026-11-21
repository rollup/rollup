System.register(['./generated-manual.js'], (function () {
	'use strict';
	var m;
	return {
		setters: [function (module) {
			m = module.m;
		}],
		execute: (function () {

			const s = 's';

			console.log(m, s);

		})
	};
}));
