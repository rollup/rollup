System.register(['external-side-effect'], function () {
	'use strict';
	return {
		setters: [function () {}],
		execute: function () {

			function onlyUsedByOne() {
				console.log('Hello');
			}

			onlyUsedByOne();

		}
	};
});
