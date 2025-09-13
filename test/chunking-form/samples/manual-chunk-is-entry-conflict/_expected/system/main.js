System.register(['./generated-dep.js'], (function (exports) {
	'use strict';
	return {
		setters: [null],
		execute: (function () {

			console.log('main');

			const value = exports("value", 42);

		})
	};
}));
