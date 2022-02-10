System.register([], (function () {
	'use strict';
	return {
		execute: (function () {

			console.log('dep2');

			console.log('dep-b');

			console.log('dep2-b');

			console.log('dep3-b');

		})
	};
}));
