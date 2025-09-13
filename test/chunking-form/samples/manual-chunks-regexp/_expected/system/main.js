System.register(['./generated-dep.js'], (function () {
	'use strict';
	return {
		setters: [null],
		execute: (function () {

			console.log('dep');

			console.log('dep2');

			console.log('dep-a');

			console.log('dep-ab');

			console.log('main');

		})
	};
}));
