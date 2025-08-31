System.register(['./generated-dep1.js'], (function () {
	'use strict';
	return {
		setters: [null],
		execute: (function () {

			console.log('dep-b');

			console.log('dep2-b');

			console.log('dep3-b');

		})
	};
}));
