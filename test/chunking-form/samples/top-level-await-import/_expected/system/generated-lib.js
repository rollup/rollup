System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			exports("g", getInfo);

			function getInfo() {
				return 'info';
			}

		})
	};
}));
