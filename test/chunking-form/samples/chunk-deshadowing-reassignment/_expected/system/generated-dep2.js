System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var x = exports('x', 43);
			console.log('dep2');

		})
	};
}));
