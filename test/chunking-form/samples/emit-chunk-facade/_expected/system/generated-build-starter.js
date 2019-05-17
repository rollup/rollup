System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			const value = exports('a', 42);
			const otherValue = exports('b', 43);

			console.log('startBuild', value);

		}
	};
});
