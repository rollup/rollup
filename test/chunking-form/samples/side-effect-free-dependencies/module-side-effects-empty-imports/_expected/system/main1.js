System.register([], (function () {
	'use strict';
	return {
		execute: (function () {

			var value = 42;
			console.log('Ignored side-effect');

			console.log('main1', value);

		})
	};
}));
