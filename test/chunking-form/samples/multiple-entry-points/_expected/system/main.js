System.register(['./other.js'], (function () {
	'use strict';
	var sharedValue;
	return {
		setters: [function (module) {
			sharedValue = module.sharedValue;
		}],
		execute: (function () {

			assert.equal(sharedValue, 'shared');

		})
	};
}));
