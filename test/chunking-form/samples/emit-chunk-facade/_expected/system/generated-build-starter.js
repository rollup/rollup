System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			var value = exports('a', 42);

			console.log('startBuild', value);

		}
	};
});
