System.register([], (function () {
	'use strict';
	return {
		execute: (function () {

			console.log('dep');

			var value = 1;

			console.log('main1', value);

		})
	};
}));
