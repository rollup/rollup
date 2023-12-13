System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var value = exports('v', 42);

			const id = exports("i", 'emitted');
			console.log(id, value);

		})
	};
}));
