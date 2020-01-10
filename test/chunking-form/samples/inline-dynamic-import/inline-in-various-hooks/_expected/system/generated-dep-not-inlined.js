System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			console.log('not inlined');
			const value = exports('value', 'not inlined');

		}
	};
});
