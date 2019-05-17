System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			const value = exports('reexported', 42);

			console.log('main2', value);

		}
	};
});
