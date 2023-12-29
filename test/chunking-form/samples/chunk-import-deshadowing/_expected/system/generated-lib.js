System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			exports("e", emptyFunction);

			function emptyFunction() {}

			console.log('lib');

		})
	};
}));
