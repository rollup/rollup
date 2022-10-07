System.register(['external-side-effect'], (function () {
	'use strict';
	return {
		setters: [null],
		execute: (function () {

			console.log('main2');

		})
	};
}));
