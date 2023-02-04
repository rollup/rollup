System.register(['./a.js'], (function () {
	'use strict';
	return {
		setters: [null],
		execute: (function () {

			console.log('main');

		})
	};
}));
