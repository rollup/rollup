System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			getIt('external').then(console.log);

		})
	};
}));
