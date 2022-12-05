System.register(['./generated-main1.js', './generated-small.js'], (function () {
	'use strict';
	var result;
	return {
		setters: [function (module) {
			result = module.r;
		}, null],
		execute: (function () {

			console.log(result);

		})
	};
}));
