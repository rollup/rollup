System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			console.log('dep');

			console.log('main');

			const value = exports('value', 42);

		}
	};
});
