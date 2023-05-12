System.register(['external1', 'external2'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports('foo', module.foo);
		}, null],
		execute: (function () {

			console.log('shared');

		})
	};
}));
