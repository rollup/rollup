System.register(['./generated-dynamic2.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports({ DYNAMIC_A: module.DYNAMIC_B, DYNAMIC_B: module.DYNAMIC_A });
		}],
		execute: (function () {

			console.log('dynamic1');

		})
	};
}));
