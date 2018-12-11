System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			console.log('dynamic2');

			const DYNAMIC_A = exports('DYNAMIC_A', 'DYNAMIC_A');
			const DYNAMIC_B = exports('DYNAMIC_B', 'DYNAMIC_B');

			console.log('dynamic1');

		}
	};
});
