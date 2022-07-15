System.register(['./generated-dep.js'], (function () {
	'use strict';
	var value;
	return {
		setters: [function (module) {
			value = module.default;
		}],
		execute: (function () {

			console.log('main1', value);

		})
	};
}));
