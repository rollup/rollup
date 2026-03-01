System.register(['./generated-has-side-effect.js'], (function () {
	'use strict';
	var B;
	return {
		setters: [function (module) {
			B = module.B;
		}],
		execute: (function () {

			console.log('main2', B);

		})
	};
}));
