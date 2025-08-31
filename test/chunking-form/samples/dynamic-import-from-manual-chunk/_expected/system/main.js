System.register(['./generated-manual.js', './main.js'], (function (exports) {
	'use strict';
	return {
		setters: [null, null],
		execute: (function () {

			const dep1 = exports("a", 'dep1');

			const dep2 = exports("d", 'dep2');

			console.log(dep1);

		})
	};
}));
