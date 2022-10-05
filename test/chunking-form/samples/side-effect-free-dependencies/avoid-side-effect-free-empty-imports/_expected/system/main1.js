System.register(['external-side-effect'], (function () {
	'use strict';
	return {
		setters: [null],
		execute: (function () {

			function onlyUsedByOne() {
				console.log('Hello');
			}

			onlyUsedByOne();

		})
	};
}));
