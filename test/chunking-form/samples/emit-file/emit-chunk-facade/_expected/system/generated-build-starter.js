System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const value = exports("v", 42);
			const otherValue = exports("o", 43);

			console.log('startBuild', value);

		})
	};
}));
