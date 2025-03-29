System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const second = exports("second", 1);

			const shared = exports("shared", second + 'shared');

			const main1 = exports("main1", 1);

			const main2 = exports("m", 2);

			const main3 = exports("a", 3);

		})
	};
}));
