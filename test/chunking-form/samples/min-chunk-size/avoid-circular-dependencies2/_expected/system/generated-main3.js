System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const second = exports("a", 1);

			const shared = exports("s", second + 'shared');

			const main1 = exports("m", 1);

			const main2 = exports("b", 2);

			const main3 = exports("c", 3);

		})
	};
}));
