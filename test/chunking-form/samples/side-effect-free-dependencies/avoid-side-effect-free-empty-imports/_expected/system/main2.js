System.register(['external-side-effect'], function () {
	'use strict';
	return {
		setters: [function () {}],
		execute: function () {

			console.log('main2');

		}
	};
});
